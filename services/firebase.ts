import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, doc, query, where, getDocs, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { PasteData } from "../types";

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyDlyb188VfYALM8FfjhoN5NAH80uIUIaMk",
  authDomain: "shopmagazina-988f7.firebaseapp.com",
  databaseURL: "https://shopmagazina-988f7-default-rtdb.firebaseio.com",
  projectId: "shopmagazina-988f7",
  storageBucket: "shopmagazina-988f7.firebasestorage.app",
  messagingSenderId: "455847708477",
  appId: "1:455847708477:web:6184ee49213846e614e754",
  measurementId: "G-H77LD6X3DV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

// Auth Services
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Database Services
export const createPaste = async (data: Omit<PasteData, 'id' | 'createdAt' | 'views'>) => {
  try {
    const docRef = await addDoc(collection(db, "pastes"), {
      ...data,
      createdAt: serverTimestamp(),
      views: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating paste", error);
    throw error;
  }
};

export const getPaste = async (id: string) => {
  try {
    const docRef = doc(db, "pastes", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        views: increment(1)
      });
      return { id: docSnap.id, ...docSnap.data() } as PasteData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching paste", error);
    throw error;
  }
};

export const getUserPastes = async (uid: string) => {
  try {
    const q = query(collection(db, "pastes"), where("authorId", "==", uid));
    const querySnapshot = await getDocs(q);
    const pastes: PasteData[] = [];
    querySnapshot.forEach((doc) => {
      pastes.push({ id: doc.id, ...doc.data() } as PasteData);
    });
    // Sort manually since we didn't create a composite index yet
    return pastes.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    console.error("Error fetching user pastes", error);
    return [];
  }
};