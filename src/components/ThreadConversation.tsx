import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { MessageCircle, Send } from 'lucide-react';
import {
  auth,
  db,
  ensureClientAuthSession,
  handleFirestoreError,
  isAnonymousAuthDisabledError,
  OperationType,
} from '../lib/firebase';
import { CONTACT_INFO, getWhatsAppUrl } from '../data/samples';
import {
  formatMessageTime,
  isValidThreadToken,
  loadSavedClientThreads,
  markThreadSeen,
  sendClientReply,
  sortMessagesChronologically,
  type ThreadMessageRecord,
  type ThreadRecord,
} from '../lib/threads';

interface ThreadConversationProps {
  threadId: string;
  fallbackClientName?: string;
  fallbackBusinessType?: string;
  fallbackPackageChoice?: string;
  autoMarkSeen?: 'always' | 'when-visible';
  onStartNewInquiry?: () => void;
}

const REPLY_COOLDOWN_MS = 3000;

export function ThreadConversation({
  threadId,
  fallbackClientName,
  fallbackBusinessType,
  fallbackPackageChoice,
  autoMarkSeen = 'always',
  onStartNewInquiry,
}: ThreadConversationProps) {
  const [authUid, setAuthUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  const [thread, setThread] = useState<ThreadRecord | null>(null);
  const [messages, setMessages] = useState<ThreadMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(autoMarkSeen === 'always');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastReplyAtRef = useRef<number>(0);

  const savedPin =
    loadSavedClientThreads().find((item) => item.threadId === threadId)?.chatPin ?? null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setAuthUid(nextUser?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isValidThreadToken(threadId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setErrorMsg(null);

    if (!authUid) {
      let active = true;
      void ensureClientAuthSession().catch((err) => {
        if (!active) return;
        setLoading(false);
        if (isAnonymousAuthDisabledError(err)) {
          setErrorMsg(
            `Anonymous chat sign-in is not enabled yet. Please message Emman on WhatsApp (${CONTACT_INFO.phoneDisplay}).`
          );
        } else {
          setErrorMsg('Could not start a chat session right now.');
        }
      });
      return () => {
        active = false;
      };
    }

    const threadRef = doc(db, 'threads', threadId);
    const unsubscribeThread = onSnapshot(
      threadRef,
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          setThread(null);
        } else {
          const data = snap.data();
          setNotFound(false);
          setThread({
            threadId: snap.id,
            inquiryId: String(data.inquiryId ?? ''),
            clientName: String(data.clientName ?? fallbackClientName ?? 'You'),
            clientUid: data.clientUid ? String(data.clientUid) : undefined,
            businessType: String(data.businessType ?? fallbackBusinessType ?? 'Local business'),
            packageChoice: String(data.packageChoice ?? fallbackPackageChoice ?? ''),
            status: (data.status as ThreadRecord['status']) ?? 'new',
            lastMessagePreview: String(data.lastMessagePreview ?? ''),
            lastMessageBy: (data.lastMessageBy as 'client' | 'owner') ?? 'client',
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          });
        }
      },
      (error) => {
        setErrorMsg('Could not load conversation details right now.');
        try {
          handleFirestoreError(error, OperationType.GET, `threads/${threadId}`);
        } catch {
          // Handled inline
        }
      }
    );

    const messagesQuery = query(
      collection(db, 'threads', threadId, 'messages'),
      where('threadId', '==', threadId)
    );

    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loaded: ThreadMessageRecord[] = snapshot.docs.map((msgDoc) => {
          const d = msgDoc.data();
          return {
            id: msgDoc.id,
            threadId: String(d.threadId ?? threadId),
            senderRole: (d.senderRole as 'client' | 'owner') ?? 'client',
            senderName: String(d.senderName ?? 'Client'),
            senderUid: d.senderUid ? String(d.senderUid) : undefined,
            body: String(d.body ?? ''),
            createdAt: d.createdAt ?? null,
          };
        });
        setMessages(sortMessagesChronologically(loaded));
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorMsg('Could not load saved messages right now.');
        try {
          handleFirestoreError(error, OperationType.LIST, `threads/${threadId}/messages`);
        } catch {
          // Handled inline
        }
      }
    );

    return () => {
      unsubscribeThread();
      unsubscribeMessages();
    };
  }, [threadId, authUid, fallbackBusinessType, fallbackClientName, fallbackPackageChoice]);

  useEffect(() => {
    if (autoMarkSeen === 'always') {
      setIsVisible(true);
      return;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoMarkSeen, threadId]);

  useEffect(() => {
    if (!isVisible || loading || !thread) return;
    if (thread.lastMessageBy === 'owner' && thread.updatedAt) {
      markThreadSeen(threadId, thread.updatedAt.toMillis());
    }
  }, [isVisible, loading, thread, threadId]);

  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages.length]);

  const submitReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;

    const elapsed = Date.now() - lastReplyAtRef.current;
    if (elapsed < REPLY_COOLDOWN_MS) {
      setErrorMsg('Please wait a moment before sending another reply.');
      return;
    }

    setErrorMsg(null);
    setSending(true);
    try {
      await sendClientReply({
        threadId,
        clientName: thread?.clientName || fallbackClientName || 'Client',
        body: trimmed,
      });
      lastReplyAtRef.current = Date.now();
      setReplyText('');
    } catch (err) {
      if (isAnonymousAuthDisabledError(err)) {
        setErrorMsg(
          `Anonymous chat sign-in is not enabled yet. Please WhatsApp Emman on ${CONTACT_INFO.phoneDisplay}.`
        );
      } else {
        setErrorMsg(
          `Could not save your reply right now. You can also WhatsApp Emman on ${CONTACT_INFO.phoneDisplay}.`
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitReply();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void submitReply();
    }
  };

  if (notFound && !loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        <p className="font-display text-base font-semibold text-slate-900">
          This conversation could not be found.
        </p>
        <p className="mt-1.5 text-slate-600">
          It may have been removed. You can start a new message or WhatsApp Emman directly.
        </p>
        {onStartNewInquiry && (
          <button
            type="button"
            onClick={onStartNewInquiry}
            className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[#0F5C43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B4734]"
          >
            Start a new message
          </button>
        )}
      </div>
    );
  }

  const hasOwnerReply = messages.some((m) => m.senderRole === 'owner');
  const displayBusiness = thread?.businessType || fallbackBusinessType || 'Local business';
  const displayPackage = thread?.packageChoice || fallbackPackageChoice || '';

  return (
    <div ref={containerRef} className="rounded-xl border border-[#0F5C43]/30 bg-white shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-[#0F5C43]/10 px-2 py-0.5 text-xs font-semibold text-[#0F5C43]">
              Saved conversation
            </span>
            {hasOwnerReply ? (
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Emman replied
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-700">
                Waiting for Emman&apos;s reply
              </span>
            )}
            {savedPin && (
              <span className="font-mono-num inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                PIN: {savedPin}
              </span>
            )}
          </div>
          <h3 className="font-display mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
            {displayBusiness}
          </h3>
          {displayPackage && <p className="text-xs text-slate-500">{displayPackage}</p>}
          <p className="mt-1 text-[11px] text-slate-500">
            Reopen on another device from <span className="font-semibold text-slate-700">My Chat</span> using your WhatsApp/email and Chat PIN.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onStartNewInquiry && (
            <button
              type="button"
              onClick={onStartNewInquiry}
              className="inline-flex min-h-[38px] cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              New inquiry
            </button>
          )}
        </div>
      </div>

      {/* Saved Messages Feed */}
      <div className="max-h-[380px] space-y-3 overflow-y-auto bg-slate-50/40 px-4 py-5 sm:px-6">
        {loading ? (
          <p className="text-sm text-slate-500">Loading saved messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages in this thread yet.</p>
        ) : (
          messages.map((msg) => {
            const isClient = msg.senderRole === 'client';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[78%] ${
                    isClient
                      ? 'rounded-br-sm bg-[#0F5C43] text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-2xs'
                  }`}
                >
                  <p
                    className={`mb-1 text-[11px] font-semibold ${
                      isClient ? 'text-emerald-100' : 'text-[#0F5C43]'
                    }`}
                  >
                    {isClient ? `You (${msg.senderName})` : 'Emman · Summit Digital'}
                  </p>
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                </div>
                <span className="mt-1 px-1 text-[11px] text-slate-400">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Client Reply Composer */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 sm:px-6 sm:py-5">
        <label htmlFor={`client-reply-${threadId}`} className="block text-xs font-semibold text-slate-700">
          Reply to Emman (your message stays saved here)
        </label>
        <textarea
          id={`client-reply-${threadId}`}
          rows={3}
          maxLength={1500}
          value={replyText}
          onChange={(e) => {
            setReplyText(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Write your reply, questions, or details about your business..."
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
        />

        {errorMsg && (
          <p role="alert" className="mt-2 text-xs font-medium text-red-700">
            {errorMsg}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0F5C43] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4734] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Saving reply...' : 'Send reply'}
          </button>

          <a
            href={getWhatsAppUrl(`Hi Emman, following up on my inquiry (${displayBusiness}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0F5C43]"
          >
            <MessageCircle className="h-4 w-4 text-[#0F5C43]" />
            Or message on WhatsApp ({CONTACT_INFO.phoneDisplay})
          </a>
        </div>
      </form>
    </div>
  );
}
