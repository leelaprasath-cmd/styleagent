import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let app, db, auth;

const firebaseConfig = {
  apiKey: "AIzaSyCx3q3E90CenFwTNUlHZ0luk38JhC81XbE",
  authDomain: "style-agent-b1dfa.firebaseapp.com",
  projectId: "style-agent-b1dfa",
  storageBucket: "style-agent-b1dfa.firebasestorage.app",
  messagingSenderId: "669506409628",
  appId: "1:669506409628:web:42d42923ff230c57524959",
  measurementId: "G-5HNJWR9FWE"
};

async function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("🔥 Firebase initialized successfully!");
    return db;
  } catch (e) {
    console.error("Firebase init failed:", e);
    return null;
  }
}

// Expose Firestore to global window object
window.FirebaseDB = {
  initFirebase,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDb: () => db
};

// Expose Auth to global window object
window.FirebaseAuth = {
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // Try popup first; fall back to redirect if popup is blocked
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        return signInWithRedirect(auth, provider);
      }
      throw err;
    }
  },
  checkRedirectResult: () => getRedirectResult(auth),
  signOut: () => signOut(auth),
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
  getAuth: () => auth
};
