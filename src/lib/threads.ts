import {
  doc,
  getDoc,
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

interface ThreadLookupEntry {
  threadId: string;
  businessType: string;
  clientName: string;
}

const STORAGE_KEY = 'summit_saved_threads_v1';

export function isValidThreadToken(id: string): boolean {
  return typeof id === 'string' && id.length >= 28 && id.length <= 64 && /^thr_[a-f0-9]+$/.test(id);
}

/**
 * Postel's Law: Be liberal in what we accept.
 * Accepts Kenyan phone numbers with spaces, dashes, 07xx, 01xx, +254, 254,
 * or standard email addresses, and normalizes them consistently for both
 * saving inquiries and looking up saved chats on any device.
 */
export function normalizeContactInput(raw: string): {
  valid: boolean;
  normalized: string;
  hint?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: false, normalized: '', hint: 'Enter a WhatsApp number or email.' };

  if (trimmed.includes('@')) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    return emailOk
      ? { valid: true, normalized: trimmed.toLowerCase(), hint: 'Email detected' }
      : { valid: false, normalized: trimmed, hint: 'Check email format (e.g. name@gmail.com).' };
  }

  const digitsOnly = trimmed.replace(/[\s\-()]/g, '');
  if (/^\+?254[17]\d{8}$/.test(digitsOnly)) {
    const clean = digitsOnly.startsWith('+') ? digitsOnly : `+${digitsOnly}`;
    return { valid: true, normalized: clean, hint: 'Kenyan WhatsApp / phone number' };
  }
  if (/^0[17]\d{8}$/.test(digitsOnly)) {
    return {
      valid: true,
      normalized: `+254${digitsOnly.slice(1)}`,
      hint: 'Kenyan WhatsApp / phone number',
    };
  }
  if (trimmed.length >= 7) {
    return { valid: true, normalized: trimmed.toLowerCase() };
  }
  return {
    valid: false,
    normalized: trimmed,
    hint: 'Use e.g. 0712 345 678, +254 712 345 678, or an email.',
  };
}

export async function computeContactLookupHash(normalizedContact: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return null;
  const input = `summit-digital:${normalizedContact.trim().toLowerCase()}`;
  const data = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  return `lk_${hex}`;
}

export async function prepareLookupEntries(
  lookupHash: string,
  newEntry: ThreadLookupEntry
): Promise<{ exists: boolean; entries: ThreadLookupEntry[] }> {
  try {
    const snap = await getDoc(doc(db, 'threadLookups', lookupHash));
    if (snap.exists()) {
      const rawThreads = snap.data().threads;
      const existingEntries: ThreadLookupEntry[] = Array.isArray(rawThreads)
        ? rawThreads
            .filter(
              (item): item is ThreadLookupEntry =>
                Boolean(item) &&
                typeof item === 'object' &&
                isValidThreadToken(String((item as ThreadLookupEntry).threadId ?? ''))
            )
            .map((item) => ({
              threadId: String(item.threadId),
              businessType: String(item.businessType).slice(0, 120),
              clientName: String(item.clientName).slice(0, 100),
            }))
        : [];
      const merged = [
        newEntry,
        ...existingEntries.filter((item) => item.threadId !== newEntry.threadId),
      ].slice(0, 10);
      return { exists: true, entries: merged };
    }
  } catch {
    // Fall back to fresh lookup document if read fails
  }
  return { exists: false, entries: [newEntry] };
}

export async function lookupThreadsByContact(
  rawContact: string
): Promise<SavedClientThreadRef[]> {
  const check = normalizeContactInput(rawContact);
  if (!check.valid) {
    throw new Error(check.hint || 'Please enter a valid WhatsApp number or email.');
  }

  const lookupHash = await computeContactLookupHash(check.normalized);
  if (!lookupHash) {
    throw new Error('Chat lookup is not supported in this browser.');
  }

  try {
    const snap = await getDoc(doc(db, 'threadLookups', lookupHash));
    if (!snap.exists()) {
      return [];
    }
    const rawThreads = snap.data().threads;
    if (!Array.isArray(rawThreads)) return [];

    const now = Date.now();
    const found: SavedClientThreadRef[] = rawThreads
      .filter(
        (item): item is ThreadLookupEntry =>
          Boolean(item) &&
          typeof item === 'object' &&
          isValidThreadToken(String((item as ThreadLookupEntry).threadId ?? ''))
      )
      .map((item, idx) => ({
        threadId: String(item.threadId),
        clientName: String(item.clientName ?? 'Client'),
        businessType: String(item.businessType ?? 'Local business'),
        savedAt: now - idx,
      }));

    if (found.length > 0) {
      // Save newest found threads into localStorage cleanly
      const existing = loadSavedClientThreads();
      const merged = [...found];
      existing.forEach((item) => {
        if (!merged.some((f) => f.threadId === item.threadId)) {
          merged.push(item);
        }
      });
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, 10)));
        } catch {
          // Ignore storage quota errors
        }
      }
    }

    return found;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `threadLookups/${lookupHash}`);
  }
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
  clientContact: string;
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
    // Legacy inquiry created before two-way threads existed: create thread + seed original inquiry + owner reply + lookup index
    const newThreadId = createThreadToken();
    const threadRef = doc(db, 'threads', newThreadId);
    const initialMsgRef = doc(db, 'threads', newThreadId, 'messages', createMessageId('0_init'));
    const replyMsgRef = doc(db, 'threads', newThreadId, 'messages', createMessageId('1_owner'));

    const safeClientName = params.clientName.trim().slice(0, 100);
    const safeName = safeClientName.length >= 2 ? safeClientName : 'Client';
    const safeBusiness = (params.businessType.trim() || 'Local business').slice(0, 120);
    const safeInitialBody = params.initialMessage.trim().slice(0, 1500) || 'Website inquiry';

    batch.set(threadRef, {
      inquiryId: params.inquiryId,
      clientName: safeName,
      businessType: safeBusiness,
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
      senderName: safeName,
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

    const contactCheck = normalizeContactInput(params.clientContact);
    if (contactCheck.valid) {
      const lookupHash = await computeContactLookupHash(contactCheck.normalized);
      if (lookupHash) {
        const prepared = await prepareLookupEntries(lookupHash, {
          threadId: newThreadId,
          businessType: safeBusiness,
          clientName: safeName,
        });
        const lookupRef = doc(db, 'threadLookups', lookupHash);
        if (prepared.exists) {
          batch.update(lookupRef, {
            threads: prepared.entries,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(lookupRef, {
            threads: prepared.entries,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    try {
      await batch.commit();
      return newThreadId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `threads/${newThreadId}`);
    }
  }
}
