import { initializeApp } from 'firebase/app';
import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import { getAuth, GoogleAuthProvider, signInAnonymously, type User } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

const enterpriseSiteKey = (import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY as string | undefined)?.trim();
const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined)?.trim();
const useEnterpriseProvider =
  Boolean(enterpriseSiteKey) ||
  (import.meta.env.VITE_RECAPTCHA_PROVIDER as string | undefined)?.trim().toLowerCase() ===
    'enterprise';
const activeAppCheckKey = enterpriseSiteKey || recaptchaSiteKey;

if (typeof window !== 'undefined' && activeAppCheckKey) {
  try {
    const appCheck = initializeAppCheck(app, {
      provider: useEnterpriseProvider
        ? new ReCaptchaEnterpriseProvider(activeAppCheckKey)
        : new ReCaptchaV3Provider(activeAppCheckKey),
      isTokenAutoRefreshEnabled: true,
    });
    void getToken(appCheck).catch(() => {
      // Ignore silent App Check warm-up errors (e.g. if blocked by an ad blocker)
    });
  } catch {
    // Ignore duplicate App Check initialization in dev
  }
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

let pendingAnonymousSignIn: Promise<User> | null = null;

export async function ensureClientAuthSession(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  if (!pendingAnonymousSignIn) {
    pendingAnonymousSignIn = signInAnonymously(auth)
      .then((cred) => cred.user)
      .finally(() => {
        pendingAnonymousSignIn = null;
      });
  }
  return pendingAnonymousSignIn;
}

export function isAnonymousAuthDisabledError(error: unknown): boolean {
  const code = (error as { code?: string })?.code ?? '';
  return (
    code === 'auth/admin-restricted-operation' ||
    code === 'auth/operation-not-allowed'
  );
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
