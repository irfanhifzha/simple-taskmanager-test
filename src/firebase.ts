import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  Firestore,
} from "firebase/firestore";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export async function initializeFirebase() {
  const response = await fetch("./firebase-config.json");

  if (!response.ok) {
    throw new Error("Failed to load Firebase config");
  }

  const firebaseConfig = await response.json();

  app = initializeApp(firebaseConfig);

  auth = getAuth(app);

  db = getFirestore(app);
}

export { app, auth, db };