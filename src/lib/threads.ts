import {
  doc,
  serverTimestamp,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export type MessageSenderRole = 'client' | 'owner';

export interface ThreadRecord {
  threadId: string;
  inquiryId: string;
  clientName: string;
  businessType: string;
  packageChoice: string;
  status: 'new' | 'replied' | 'archived';
  lastMessagePreview: string;
  lastMessageBy: MessageSenderRole;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ThreadMessageRecord {
  id: string;
  threadId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  body: string;
  createdAt?: Timestamp | null;
}

export interface SavedClientThreadRef {
  threadId: string;
  clientName: string;
  businessType: string;
  savedAt: number;
}

const STORAGE_KEY = 'summit_saved_threads_v1';

export function isValidThreadToken(id: string): boolean {
  return typeof id === 'string' && id.length >= 28 && id.length <= 64 && /^thr_[a-f0-9]+$/.test(id);
}

export function createThreadToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `thr_${hex}`;
}

export function createMessageId(orderPrefix = 'm'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `msg_${Date.now().toString(36)}_${orderPrefix}_${rand}`;
}

export function buildPreview(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 180) return normalized || 'New message';
  return `${normalized.slice(0, 177)}...`;
}

export function sortMessagesChronologically(items: ThreadMessageRecord[]): ThreadMessageRecord[] {
  return [...items].sort((a, b) => {
    const aMs = a.createdAt ? a.createdAt.toMillis() : Number.MAX_SAFE_INTEGER;
    const bMs = b.createdAt ? b.createdAt.toMillis() : Number.MAX_SAFE_INTEGER;
    if (aMs !== bMs) return aMs - bMs;
    return a.id.localeCompare(b.id);
  });
}

export function formatMessageTime(ts?: Timestamp | null): string {
  if (!ts) return 'Just now';
  const date = ts.toDate();
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${timeStr}`;

  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr}, ${timeStr}`;
}

export function getThreadShareUrl(threadId: string): string {
  if (typeof window === 'undefined') return `#/thread/${threadId}`;
  return `${window.location.origin}${window.location.pathname}#/thread/${threadId}`;
}

export function loadSavedClientThreads(): SavedClientThreadRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SavedClientThreadRef =>
          Boolean(item) &&
          typeof item === 'object' &&
          isValidThreadToken(String((item as SavedClientThreadRef).threadId ?? ''))
      )
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function saveClientThreadRef(entry: SavedClientThreadRef): SavedClientThreadRef[] {
  const existing = loadSavedClientThreads().filter((item) => item.threadId !== entry.threadId);
  const next = [entry, ...existing].slice(0, 10);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota issues cleanly
    }
  }
  return next;
}

export async function sendClientReply(params: {
  threadId: string;
  clientName: string;
  body: string;
}): Promise<void> {
  const trimmedBody = params.body.trim().slice(0, 1500);
  const trimmedName = (params.clientName.trim() || 'Client').slice(0, 100);
  if (!trimmedBody || !isValidThreadToken(params.threadId)) {
    throw new Error('Cannot send an empty reply.');
  }

  const msgId = createMessageId('c');
  const threadRef = doc(db, 'threads', params.threadId);
  const msgRef = doc(db, 'threads', params.threadId, 'messages', msgId);

  const batch = writeBatch(db);
  batch.set(msgRef, {
    threadId: params.threadId,
    senderRole: 'client',
    senderName: trimmedName.length >= 2 ? trimmedName : 'Client',
    body: trimmedBody,
    createdAt: serverTimestamp(),
  });
  batch.update(threadRef, {
    lastMessagePreview: buildPreview(trimmedBody),
    lastMessageBy: 'client',
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `threads/${params.threadId}/messages/${msgId}`);
  }
}

export async function sendOwnerReply(params: {
  inquiryId: string;
  threadId: string | null;
  clientName: string;
  businessType: string;
  packageChoice: string;
  initialMessage: string;
  body: string;
}): Promise<string> {
  const trimmedBody = params.body.trim().slice(0, 1500);
  if (!trimmedBody) {
    throw new Error('Please write a reply before sending.');
  }

  const inquiryRef = doc(db, 'inquiries', params.inquiryId);
  const batch = writeBatch(db);

  if (params.threadId && isValidThreadToken(params.threadId)) {
    const threadId = params.threadId;
    const threadRef = doc(db, 'threads', threadId);
    const msgId = createMessageId('o');
    const msgRef = doc(db, 'threads', threadId, 'messages', msgId);

    batch.set(msgRef, {
      threadId,
      senderRole: 'owner',
      senderName: 'Emman',
      body: trimmedBody,
      createdAt: serverTimestamp(),
    });
    batch.update(threadRef, {
      status: 'replied',
      lastMessagePreview: buildPreview(trimmedBody),
      lastMessageBy: 'owner',
      updatedAt: serverTimestamp(),
    });
    batch.update(inquiryRef, {
      status: 'replied',
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      return threadId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `threads/${threadId}/messages/${msgId}`);
    }
  } else {
    // Legacy inquiry created before two-way threads existed: create thread + seed original inquiry + owner reply
    const newThreadId = createThreadToken();
    const threadRef = doc(db, 'threads', newThreadId);
    const initialMsgRef = doc(db, 'threads', newThreadId, 'messages', createMessageId('0_init'));
    const replyMsgRef = doc(db, 'threads', newThreadId, 'messages', createMessageId('1_owner'));

    const safeClientName = params.clientName.trim().slice(0, 100);
    const safeInitialBody = params.initialMessage.trim().slice(0, 1500) || 'Website inquiry';

    batch.set(threadRef, {
      inquiryId: params.inquiryId,
      clientName: safeClientName.length >= 2 ? safeClientName : 'Client',
      businessType: (params.businessType.trim() || 'Local business').slice(0, 120),
      packageChoice: params.packageChoice,
      status: 'replied',
      lastMessagePreview: buildPreview(trimmedBody),
      lastMessageBy: 'owner',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(initialMsgRef, {
      threadId: newThreadId,
      senderRole: 'client',
      senderName: safeClientName.length >= 2 ? safeClientName : 'Client',
      body: safeInitialBody,
      createdAt: serverTimestamp(),
    });
    batch.set(replyMsgRef, {
      threadId: newThreadId,
      senderRole: 'owner',
      senderName: 'Emman',
      body: trimmedBody,
      createdAt: serverTimestamp(),
    });
    batch.update(inquiryRef, {
      threadId: newThreadId,
      status: 'replied',
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      return newThreadId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `threads/${newThreadId}`);
    }
  }
}
