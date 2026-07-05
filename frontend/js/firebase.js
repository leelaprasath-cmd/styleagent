import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let app, db;

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
    console.log("🔥 Firebase initialized successfully!");
    return db;
  } catch (e) {
    console.error("Firebase init failed:", e);
    return null;
  }
}

// Expose to global window object so other scripts can access it without being ES modules
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
