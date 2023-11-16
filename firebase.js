import { initializeApp } from "firebase/app";
// import { getAuth , signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword , updateProfile, signInAnonymously, onAuthStateChanged} from "firebase/auth";
// import {getFirestore, updateDoc, arrayUnion, arrayRemove, FieldValue, query, limit, collection, doc, getDocs,setDoc, addDoc, where} from "firebase/firestore";
import { getAuth , GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCQjSbrVzlmeaPnmAIbSSGPUTVyEdbh_Kk",
  authDomain: "ai-app-65fac.firebaseapp.com",
  projectId: "ai-app-65fac",
  storageBucket: "ai-app-65fac.appspot.com",
  messagingSenderId: "973384691133",
  appId: "1:973384691133:web:5173b4f7358492ce9cf6d4",
  measurementId: "G-MLFNZKQB7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage();