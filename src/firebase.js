import { initializeApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
 } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
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


export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});


// https://firebase.google.com/docs/firestore/manage-data/add-data