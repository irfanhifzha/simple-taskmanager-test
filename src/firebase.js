// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth }  from "firebase/auth";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
 } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCz4PQvJQCws_xzFCNt0dkXyC8UBUZ8-3I",
  authDomain: "simple-taskmanager-test-11509.firebaseapp.com",
  projectId: "simple-taskmanager-test-11509",
  storageBucket: "simple-taskmanager-test-11509.firebasestorage.app",
  messagingSenderId: "433976136484",
  appId: "1:433976136484:web:00944a6f624263f62299b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});