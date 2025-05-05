// client/firebase/index.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHQor_VBaIH_aw30_PGQ-pU4ljqyv0op8",
    authDomain: "dreamnft-831df.firebaseapp.com",
    projectId: "dreamnft-831df",
    storageBucket: "dreamnft-831df.firebasestorage.app",
    messagingSenderId: "965353386187",
    appId: "1:965353386187:web:1cefe3aa76b12d08276b4e",
    measurementId: "G-BW6602TRSJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;