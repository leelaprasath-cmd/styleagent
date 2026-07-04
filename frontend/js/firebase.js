import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let app, db;

async function initFirebase() {
  try {
    const res = await fetch('/api/firebase-config');
    if (!res.ok) {
      console.warn("Firebase not configured on backend. Chat history will not persist.");
      return null;
    }
    const config = await res.json();
    if (!config.apiKey) return null;
    
    app = initializeApp(config);
    db = getFirestore(app);
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
