import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "forgix-c0084.firebaseapp.com",
  projectId: "forgix-c0084",
  storageBucket: "forgix-c0084.firebasestorage.app",
  messagingSenderId: "784288385423",
  appId: "1:784288385423:web:5d472f92b8aa71bb7da3fa",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { auth, provider };
