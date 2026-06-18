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
  apiKey: "AIzaSyAXLvfgol39_nqGnDazscRaH8_M6-kkQGA",
  authDomain: "jadwaldigitalbdg.firebaseapp.com",
  projectId: "jadwaldigitalbdg",
  storageBucket: "jadwaldigitalbdg.firebasestorage.app",
  messagingSenderId: "359514657352",
  appId: "1:359514657352:web:5c8976ef52653a9ac2fe7d",
  measurementId: "G-7B8TXT2S5R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});