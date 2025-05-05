import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import analytics from '@react-native-firebase/analytics';

const firebaseConfig = {
  // Your Firebase config from google-services.json
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

export { app, auth, firestore, storage, analytics };