// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getStorage,ref} from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWO9hN0qG_EgoGlnZoOcjIUFx2rFPQDas",
  authDomain: "paiesmart-a9ed9.firebaseapp.com",
  projectId: "paiesmart-a9ed9",
  storageBucket: "paiesmart-a9ed9.firebasestorage.app",
  messagingSenderId: "585368103071",
  appId: "1:585368103071:web:5bde2cb78cf5baaa4a1aaa"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
export const FIREBASE_REF = ref(FIREBASE_STORAGE);
export const FIREBASE_FIRESTORE = getFirestore(FIREBASE_APP);
