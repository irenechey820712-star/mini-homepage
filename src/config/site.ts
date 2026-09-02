/* Firebase 웹 설정입니다.
   apiKey 등은 "비밀키"가 아니라 프로젝트를 가리키는 공개 식별자이고,
   배포된 JS 에 그대로 들어가는 것이 정상입니다. 실제 쓰기 권한은
   firestore.rules 가 소유자 UID 로 잠급니다.

   빈 값이면 로그인·편집 기능이 꺼지고, 사이트는 linktree.ts 예시값으로만 동작합니다.
   환경변수(NEXT_PUBLIC_FIREBASE_*)가 있으면 그 값이 우선합니다. */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA4At70c1BpTD_Mrmy4t-7D0WCh-CNobEk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ilring-lab.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ilring-lab",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ilring-lab.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "970907080366",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:970907080366:web:3078bda77a85c389a5ff3f"
};

/* 이 사이트를 편집할 수 있는 소유자의 Firebase Auth UID 입니다.
   처음엔 비워 두고, 배포된 사이트에서 Google 로그인을 한 번 하면
   편집바에 내 UID 가 표시됩니다. 그 값을 여기에 붙여넣고 다시 배포하세요.
   (firestore.rules 의 ownerUid 도 같은 값으로 맞춰야 합니다.) */
export const OWNER_UID = process.env.NEXT_PUBLIC_OWNER_UID || "";
