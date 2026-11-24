import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  buildClientNudgeAction,
  formatMessageTime,
  isValidThreadToken,
  sendOwnerReply,
  sortMessagesChronologically,
  type ThreadMessageRecord,
  type ThreadRecord,
} from '../lib/threads';

interface OwnerInboxProps {
  onBack: () => void;
}

interface InquiryRecord {
  id: string;
  name: string;
  contact: string;
  businessType: string;
  packageChoice: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
  threadId: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const OWNER_EMAILS = ['summit.digitalll@gmail.com', 'emmannthiga25@gmail.com'];

interface OwnerThreadPanelProps {
  inquiry: InquiryRecord;
  threadMeta?: ThreadRecord;
}

function OwnerThreadPanel({ inquiry, threadMeta }: OwnerThreadPanelProps) {
  const [messages, setMessages] = useState<ThreadMessageRecord[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(Boolean(inquiry.threadId));
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [justRepliedText, setJustRepliedText] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);

  const activeThreadId = inquiry.threadId || threadMeta?.threadId || null;

  useEffect(() => {
    if (!activeThreadId || !isValidThreadToken(activeThreadId)) {
      setLoadingMsgs(false);
      setMessages([]);
      return;
    }

    setLoadingMsgs(true);
    const messagesQuery = query(
      collection(db, 'threads', activeThreadId, 'messages'),
      where('threadId', '==', activeThreadId)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loaded: ThreadMessageRecord[] = snapshot.docs.map((msgDoc) => {
          const d = msgDoc.data();
          return {
            id: msgDoc.id,
            threadId: String(d.threadId ?? activeThreadId),
            senderRole: (d.senderRole as 'client' | 'owner') ?? 'client',
            senderName: String(d.senderName ?? inquiry.name),
            body: String(d.body ?? ''),
            createdAt: d.createdAt ?? null,
          };
        });
        setMessages(sortMessagesChronologically(loaded));
        setLoadingMsgs(false);
      },
      (error) => {
        setLoadingMsgs(false);
        setPanelError('Could not load thread messages.');
        try {
          handleFirestoreError(error, OperationType.LIST, `threads/${activeThreadId}/messages`);
        } catch {
          // Shown inline
        }
      }
    );

    return () => unsubscribe();
  }, [activeThreadId, inquiry.name]);

  const submitReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;

    setPanelError(null);
    setSending(true);
    try {
      await sendOwnerReply({
        inquiryId: inquiry.id,
        threadId: activeThreadId,
        clientName: inquiry.name,
        clientContact: inquiry.contact,
        businessType: inquiry.businessType,
        packageChoice: inquiry.packageChoice,
        initialMessage: inquiry.message,
        body: trimmed,
      });
      setJustRepliedText(trimmed);
      setReplyText('');
    } catch {
      setPanelError('Could not save your reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const latestOwnerReply =
    justRepliedText ||
    [...messages].reverse().find((m) => m.senderRole === 'owner')?.body ||
    undefined;

  const nudgeAction = buildClientNudgeAction({
    contact: inquiry.contact,
    clientName: inquiry.name,
    businessType: inquiry.businessType,
    replyPreview: latestOwnerReply,
  });

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

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-semibold text-slate-700">
          Saved conversation ({messages.length > 0 ? `${messages.length} messages` : 'Original message'})
        </span>
        <span className="text-[11px] text-slate-500">
          Client can reopen under My Chat with {inquiry.contact}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="mt-3 max-h-[320px] space-y-2.5 overflow-y-auto pr-1">
        {loadingMsgs ? (
          <p className="text-xs text-slate-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800">
              <p className="mb-1 text-[11px] font-semibold text-slate-500">{inquiry.name}</p>
              <p className="whitespace-pre-wrap break-words">{inquiry.message}</p>
            </div>
            <span className="mt-1 px-1 text-[11px] text-slate-400">
              {formatMessageTime(inquiry.createdAt)}
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwner = msg.senderRole === 'owner';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isOwner
                      ? 'rounded-br-sm bg-[#0F5C43] text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <p
                    className={`mb-0.5 text-[11px] font-semibold ${
                      isOwner ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {isOwner ? 'Emman (You)' : msg.senderName}
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
      </div>

      {/* Owner Reply Box */}
      <form onSubmit={handleSubmit} className="mt-3 border-t border-slate-200 pt-3">
        <label htmlFor={`owner-reply-${inquiry.id}`} className="sr-only">
          Reply to {inquiry.name}
        </label>
        <textarea
          id={`owner-reply-${inquiry.id}`}
          rows={2}
          maxLength={1500}
          value={replyText}
          onChange={(e) => {
            setReplyText(e.target.value);
            if (panelError) setPanelError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Write a saved reply to ${inquiry.name}...`}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F5C43] focus:outline-none focus:ring-2 focus:ring-[#0F5C43]/15"
        />

        {panelError && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
            {panelError}
          </p>
        )}

        {justRepliedText && nudgeAction && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            <span className="font-medium">
              Reply saved. Send a quick nudge so {inquiry.name.split(' ')[0]} checks it:
            </span>
            <a
              href={nudgeAction.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#0F5C43] px-3 py-1.5 font-semibold text-white hover:bg-[#0B4734]"
            >
              {nudgeAction.type === 'whatsapp' ? (
                <MessageCircle className="h-3.5 w-3.5" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              {nudgeAction.label}
            </a>
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg bg-[#0F5C43] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0B4734] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Sending...' : 'Send saved reply'}
            </button>

            {nudgeAction && (
              <a
                href={nudgeAction.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-[#0F5C43] hover:text-[#0F5C43]"
              >
                {nudgeAction.type === 'whatsapp' ? (
                  <MessageCircle className="h-3.5 w-3.5 text-[#0F5C43]" />
                ) : (
                  <Mail className="h-3.5 w-3.5 text-[#0F5C43]" />
                )}
                {nudgeAction.label}
              </a>
            )}
          </div>

          <span className="text-[11px] text-slate-500">
            Saved here for {inquiry.name} to read and reply back
          </span>
        </div>
      </form>
    </div>
  );
}

export function OwnerInbox({ onBack }: OwnerInboxProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [threadsById, setThreadsById] = useState<Record<string, ThreadRecord>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unauthorizedHost, setUnauthorizedHost] = useState<string | null>(null);
  const [offerRedirectFallback, setOfferRedirectFallback] = useState(false);

  useEffect(() => {
    void getRedirectResult(auth).catch((err: unknown) => {
      const code = (err as { code?: string })?.code;
      if (code && code !== 'auth/no-auth-event') {
        setErrorMsg(`Sign-in error (${code}). Please try again.`);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setInquiries([]);
        setThreadsById({});
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;

    const userEmail = (user.email ?? '').toLowerCase();
    if (!OWNER_EMAILS.includes(userEmail)) {
      setLoading(false);
      setErrorMsg(
        `Signed in as ${user.email}, which is not an owner account. Sign out and choose summit.digitalll@gmail.com or emmannthiga25@gmail.com.`
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const inquiriesRef = collection(db, 'inquiries');
    const qInquiries = query(inquiriesRef, orderBy('createdAt', 'desc'));

    const unsubscribeInquiries = onSnapshot(
      qInquiries,
      (snapshot) => {
        const items: InquiryRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: String(data.name ?? ''),
            contact: String(data.contact ?? ''),
            businessType: String(data.businessType ?? ''),
            packageChoice: String(data.packageChoice ?? ''),
            message: String(data.message ?? ''),
            status: (data.status as 'new' | 'replied' | 'archived') ?? 'new',
            threadId: data.threadId ? String(data.threadId) : null,
            createdAt: (data.createdAt as Timestamp | null) ?? null,
            updatedAt: (data.updatedAt as Timestamp | null) ?? null,
          };
        });
        setInquiries(items);
        setExpandedId((prev) => prev ?? (items[0]?.id || null));
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorMsg(
          `Could not load inquiries for ${user.email}. Ensure you are signed in with a verified owner email.`
        );
        try {
          handleFirestoreError(error, OperationType.LIST, 'inquiries');
        } catch {
          // Handled in UI state above
        }
      }
    );

    const threadsRef = collection(db, 'threads');
    const qThreads = query(threadsRef, orderBy('updatedAt', 'desc'));

    const unsubscribeThreads = onSnapshot(
      qThreads,
      (snapshot) => {
        const mapped: Record<string, ThreadRecord> = {};
        snapshot.docs.forEach((tSnap) => {
          const d = tSnap.data();
          mapped[tSnap.id] = {
            threadId: tSnap.id,
            inquiryId: String(d.inquiryId ?? ''),
            clientName: String(d.clientName ?? ''),
            businessType: String(d.businessType ?? ''),
            packageChoice: String(d.packageChoice ?? ''),
            status: (d.status as ThreadRecord['status']) ?? 'new',
            lastMessagePreview: String(d.lastMessagePreview ?? ''),
            lastMessageBy: (d.lastMessageBy as 'client' | 'owner') ?? 'client',
            createdAt: (d.createdAt as Timestamp | null) ?? null,
            updatedAt: (d.updatedAt as Timestamp | null) ?? null,
          };
        });
        setThreadsById(mapped);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'threads');
        } catch {
          // Non-fatal; inquiries list still displays
        }
      }
    );

    return () => {
      unsubscribeInquiries();
      unsubscribeThreads();
    };
  }, [authReady, user]);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setUnauthorizedHost(null);
    setOfferRedirectFallback(false);
    setSigningIn(true);
    googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      const code = firebaseErr?.code || 'unknown';

      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        setOfferRedirectFallback(true);
        setErrorMsg(
          'Your browser blocked the Google sign-in popup. Click "Continue with redirect" below, or allow popups for this site.'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in window was closed before completing. Click below to try again.');
      } else if (code === 'auth/unauthorized-domain') {
        const host = window.location.hostname;
        setUnauthorizedHost(host);
        setErrorMsg(
          `Domain ${host} is not authorized in Firebase Authentication settings yet.`
        );
      } else {
        setErrorMsg(`Google sign-in failed (${code}). Please try again.`);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleRedirectSignIn = async () => {
    setErrorMsg(null);
    setUnauthorizedHost(null);
    googleAuthProvider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, googleAuthProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || 'unknown';
      if (code === 'auth/unauthorized-domain') {
        const host = window.location.hostname;
        setUnauthorizedHost(host);
        setErrorMsg(
          `Domain ${host} is not authorized in Firebase Authentication settings yet.`
        );
      } else {
        setErrorMsg(`Redirect sign-in failed (${code}).`);
      }
    }
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
    await handleSignIn();
  };

  const handleStatusChange = async (
    item: InquiryRecord,
    nextStatus: 'new' | 'replied' | 'archived'
  ) => {
    const path = `inquiries/${item.id}`;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'inquiries', item.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      if (item.threadId && threadsById[item.threadId]) {
        batch.update(doc(db, 'threads', item.threadId), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      setErrorMsg('Could not update inquiry status.');
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch {
        // Logged by handleFirestoreError
      }
    }
  };

  const handleDelete = async (item: InquiryRecord) => {
    const path = `inquiries/${item.id}`;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'inquiries', item.id));
      if (item.threadId && threadsById[item.threadId]) {
        batch.delete(doc(db, 'threads', item.threadId));
      }
      await batch.commit();
    } catch (error) {
      setErrorMsg('Could not delete inquiry.');
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch {
        // Logged by handleFirestoreError
      }
    }
  };

  const sortedInquiries = [...inquiries].sort((a, b) => {
    const aThread = a.threadId ? threadsById[a.threadId] : undefined;
    const bThread = b.threadId ? threadsById[b.threadId] : undefined;
    const aMs = (aThread?.updatedAt ?? a.updatedAt ?? a.createdAt)?.toMillis() ?? 0;
    const bMs = (bThread?.updatedAt ?? b.updatedAt ?? b.createdAt)?.toMillis() ?? 0;
    return bMs - aMs;
  });

  const filtered =
    statusFilter === 'all'
      ? sortedInquiries
      : sortedInquiries.filter((item) => item.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Summit Digital
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 sm:inline">{user.email}</span>
              <button
                type="button"
                onClick={() => void signOut(auth)}
                className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Owner Inbox</h1>
        <p className="mt-1 text-sm text-slate-600">
          Client inquiries and saved two-way conversations from Summit Digital.
        </p>

        {!authReady ? (
          <p className="mt-8 text-sm text-slate-500">Loading...</p>
        ) : !user ? (
          <div className="mt-8 max-w-md rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Sign in to view inquiries
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Use your Google account (
              <span className="font-medium text-slate-800">summit.digitalll@gmail.com</span>) to
              read and reply to client messages.
            </p>
            {errorMsg && (
              <div role="alert" className="mt-3 space-y-2 text-sm font-medium text-red-700">
                <p>{errorMsg}</p>
                {unauthorizedHost && (
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0339854637/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-semibold text-[#0F5C43] underline underline-offset-4 hover:text-[#0B4734]"
                  >
                    Open Firebase Authorized Domains for gen-lang-client-0339854637 →
                  </a>
                )}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void handleSignIn()}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[#0F5C43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B4734] disabled:opacity-60"
              >
                {signingIn ? 'Opening Google...' : 'Sign in with Google'}
              </button>
              {offerRedirectFallback && (
                <button
                  type="button"
                  onClick={() => void handleRedirectSignIn()}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Continue with redirect
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
                {(['all', 'new', 'replied', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <span className="font-mono-num text-xs text-slate-500">
                {filtered.length} {filtered.length === 1 ? 'inquiry' : 'inquiries'}
              </span>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => void handleSwitchAccount()}
                  className="cursor-pointer font-semibold underline underline-offset-2 hover:text-red-900"
                >
                  Switch Google account
                </button>
              </div>
            )}

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Loading inquiries...</p>
            ) : filtered.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                No inquiries in this view yet.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {filtered.map((item) => {
                  const threadMeta = item.threadId ? threadsById[item.threadId] : undefined;
                  const isExpanded = expandedId === item.id;
                  const awaitingOwnerReply = threadMeta?.lastMessageBy === 'client';

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                            <span>
                              {item.businessType} · {item.packageChoice}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 capitalize ${
                                item.status === 'new'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'replied'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.status}
                            </span>
                            {awaitingOwnerReply && item.status !== 'archived' && (
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                                Client message waiting
                              </span>
                            )}
                          </div>
                          <h2 className="font-display mt-1.5 text-base font-bold text-slate-900">
                            {item.name}
                          </h2>
                          <p className="text-sm font-medium text-[#0F5C43]">{item.contact}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-[#0F5C43]" />
                            <span>{isExpanded ? 'Hide thread' : 'Reply / View thread'}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <select
                            aria-label={`Status for ${item.name}`}
                            value={item.status}
                            onChange={(e) =>
                              void handleStatusChange(
                                item,
                                e.target.value as 'new' | 'replied' | 'archived'
                              )
                            }
                            className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                          >
                            <option value="new">New</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            aria-label={`Delete inquiry from ${item.name}`}
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {!isExpanded && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                          {threadMeta?.lastMessagePreview
                            ? `${threadMeta.lastMessageBy === 'owner' ? 'You: ' : `${item.name}: `}${threadMeta.lastMessagePreview}`
                            : item.message}
                        </p>
                      )}

                      {isExpanded && <OwnerThreadPanel inquiry={item} threadMeta={threadMeta} />}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
