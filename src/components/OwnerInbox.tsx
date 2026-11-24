import { useEffect, useState } from 'react';
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
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { ArrowLeft, LogOut, Trash2 } from 'lucide-react';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

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
  createdAt?: Timestamp | null;
}

const OWNER_EMAILS = ['summit.digitalll@gmail.com', 'emmannthiga25@gmail.com'];

export function OwnerInbox({ onBack }: OwnerInboxProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [offerRedirectFallback, setOfferRedirectFallback] = useState(false);

  useEffect(() => {
    // Handle redirect sign-in completion if popup fallback was used
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
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
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
            createdAt: (data.createdAt as Timestamp | null) ?? null,
          };
        });
        setInquiries(items);
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

    return () => unsubscribe();
  }, [authReady, user]);

  const handleSignIn = async () => {
    setErrorMsg(null);
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
        setErrorMsg(
          `Domain ${window.location.hostname} is not authorized in Firebase Authentication settings yet.`
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
    googleAuthProvider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, googleAuthProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || 'unknown';
      setErrorMsg(`Redirect sign-in failed (${code}).`);
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
      await updateDoc(doc(db, 'inquiries', item.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMsg('Could not update inquiry status.');
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch {
        // Logged by handleFirestoreError
      }
    }
  };

  const handleDelete = async (id: string) => {
    const path = `inquiries/${id}`;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (error) {
      setErrorMsg('Could not delete inquiry.');
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch {
        // Logged by handleFirestoreError
      }
    }
  };

  const filtered =
    statusFilter === 'all'
      ? inquiries
      : inquiries.filter((item) => item.status === statusFilter);

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
          Client messages submitted from the Summit Digital contact form.
        </p>

        {!authReady ? (
          <p className="mt-8 text-sm text-slate-500">Loading...</p>
        ) : !user ? (
          <div className="mt-8 max-w-md rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Sign in to view inquiries
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Use your Google account (<span className="font-medium text-slate-800">summit.digitalll@gmail.com</span>) to read or update client messages.
            </p>
            {errorMsg && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                {errorMsg}
              </p>
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
              <div className="mt-4 space-y-3">
                {filtered.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {item.businessType} · {item.packageChoice} ·{' '}
                          <span className="capitalize text-slate-700">{item.status}</span>
                        </p>
                        <h2 className="font-display mt-1 text-base font-bold text-slate-900">
                          {item.name}
                        </h2>
                        <p className="text-sm font-medium text-[#0F5C43]">{item.contact}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Status for ${item.name}`}
                          value={item.status}
                          onChange={(e) =>
                            void handleStatusChange(
                              item,
                              e.target.value as 'new' | 'replied' | 'archived'
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                        >
                          <option value="new">New</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item.id)}
                          aria-label={`Delete inquiry from ${item.name}`}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.message}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
