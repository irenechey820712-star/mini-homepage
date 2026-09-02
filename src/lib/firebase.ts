/* Firebase 연동 계층입니다.
   - 한줄평(방명록) + 방문 수: 로그인 없이 누구나 읽고, 방명록은 누구나 한 줄 남깁니다.
   - 사이트 콘텐츠(site/content): 읽기는 누구나, 쓰기는 소유자(OWNER_UID)만.
   Firebase 웹 설정값은 비밀키가 아니라 프로젝트 식별자이며, 배포된 JS 에 들어가는 것이 정상입니다.
   실제 접근 제어는 firestore.rules 가 담당합니다. */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type Auth,
  type User
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Timestamp
} from "firebase/firestore";
import { firebaseConfig, OWNER_UID } from "@/config/site";

/* 설정이 없으면 Firestore/Auth 를 쓰지 않고, 화면은 linktree.ts 예시값으로 동작합니다. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
export const isGuestbookEnabled = isFirebaseConfigured;
export const isCounterEnabled = isFirebaseConfigured;
/* 편집 기능은 소유자 UID 까지 있어야 켜집니다. UID 가 없으면 로그인 버튼만 떠서 UID 를 확인할 수 있습니다. */
export const isEditingConfigured = isFirebaseConfigured;
export { OWNER_UID };

export const GUESTBOOK_LIMITS = { author: 20, text: 100 } as const;

export type RemoteEntry = {
  id: string;
  author: string;
  text: string;
  date: string;
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getFirebaseApp() {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig as Record<string, string>);
  return app;
}

function getDb() {
  if (!isFirebaseConfigured) return null;
  if (!db) db = getFirestore(getFirebaseApp()!);
  return db;
}

function getAuthInstance() {
  if (!isFirebaseConfigured) return null;
  if (!auth) auth = getAuth(getFirebaseApp()!);
  return auth;
}

function formatDate(value: unknown) {
  const date = value && typeof (value as Timestamp).toDate === "function"
    ? (value as Timestamp).toDate()
    : new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/* ---------------------------------------------------------------
   소유자 로그인 (Google)
   --------------------------------------------------------------- */
export type OwnerState = { uid: string; name: string; isOwner: boolean } | null;

export function watchAuth(cb: (state: OwnerState) => void) {
  const a = getAuthInstance();
  if (!a) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, (user: User | null) => {
    if (!user) {
      cb(null);
      return;
    }
    cb({
      uid: user.uid,
      name: user.displayName || user.email || "로그인됨",
      isOwner: Boolean(OWNER_UID) && user.uid === OWNER_UID
    });
  });
}

export async function signInOwner() {
  const a = getAuthInstance();
  if (!a) throw new Error("로그인 기능이 설정되지 않았습니다.");
  await signInWithPopup(a, new GoogleAuthProvider());
}

export async function signOutOwner() {
  const a = getAuthInstance();
  if (a) await fbSignOut(a);
}

/* ---------------------------------------------------------------
   사이트 콘텐츠 (site/content 문서 하나에 편집 가능한 값들을 담습니다)
   --------------------------------------------------------------- */
export type SiteContent = Record<string, unknown>;

export function watchSiteContent(cb: (content: SiteContent) => void) {
  const store = getDb();
  if (!store) {
    cb({});
    return () => {};
  }
  return onSnapshot(
    doc(store, "site", "content"),
    snap => cb((snap.exists() ? snap.data() : {}) as SiteContent),
    () => cb({})
  );
}

export async function saveSiteContent(patch: SiteContent) {
  const store = getDb();
  if (!store) throw new Error("편집 기능이 설정되지 않았습니다.");
  await setDoc(doc(store, "site", "content"), patch, { merge: true });
}

/* ---------------------------------------------------------------
   방문 수 (counters/site)
   --------------------------------------------------------------- */
export type VisitCounts = { total: number; today: number };

function seoulDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export async function recordVisit(): Promise<VisitCounts> {
  const store = getDb();
  if (!store) throw new Error("방문 수 기능이 설정되지 않았습니다.");

  const ref = doc(store, "counters", "site");
  const day = seoulDay();

  return runTransaction(store, async transaction => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      const first = { total: 1, today: 1, day };
      transaction.set(ref, first);
      return { total: first.total, today: first.today };
    }

    const data = snapshot.data();
    const total = Number(data.total ?? 0) + 1;
    const today = data.day === day ? Number(data.today ?? 0) + 1 : 1;

    transaction.update(ref, { total, today, day });
    return { total, today };
  });
}

/* ---------------------------------------------------------------
   한줄평 (guestbook)
   --------------------------------------------------------------- */
export function subscribeGuestbook(
  count: number,
  onData: (entries: RemoteEntry[]) => void,
  onError: (error: Error) => void
) {
  const store = getDb();
  if (!store) return () => {};

  const q = query(collection(store, "guestbook"), orderBy("createdAt", "desc"), fsLimit(count));
  return onSnapshot(
    q,
    snapshot => {
      onData(
        snapshot.docs.map(entry => {
          const data = entry.data();
          return {
            id: entry.id,
            author: String(data.author ?? ""),
            text: String(data.text ?? ""),
            date: formatDate(data.createdAt)
          };
        })
      );
    },
    error => onError(error as Error)
  );
}

export async function addGuestbookEntry(author: string, text: string) {
  const store = getDb();
  if (!store) throw new Error("한줄평 기능이 설정되지 않았습니다.");

  const trimmedAuthor = author.trim();
  const trimmedText = text.trim();

  if (!trimmedAuthor || !trimmedText) throw new Error("이름과 한줄평을 모두 적어 주세요.");
  if (trimmedAuthor.length > GUESTBOOK_LIMITS.author) throw new Error(`이름은 ${GUESTBOOK_LIMITS.author}자까지 쓸 수 있어요.`);
  if (trimmedText.length > GUESTBOOK_LIMITS.text) throw new Error(`한줄평은 ${GUESTBOOK_LIMITS.text}자까지 쓸 수 있어요.`);

  await addDoc(collection(store, "guestbook"), {
    author: trimmedAuthor,
    text: trimmedText,
    approved: true,
    createdAt: serverTimestamp()
  });
}
