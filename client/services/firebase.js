// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHQor_VBaIH_aw30_PGQ-pU4ljqyv0op8",
    authDomain: "dreamnft-831df.firebaseapp.com",
    projectId: "dreamnft-831df",
    storageBucket: "dreamnft-831df.firebasestorage.app",
    messagingSenderId: "965353386187",
    appId: "1:965353386187:web:1cefe3aa76b12d08276b4e",
    measurementId: "G-BW6602TRSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };