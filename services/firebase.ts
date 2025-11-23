import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, doc, query, where, getDocs, serverTimestamp, updateDoc, increment, Timestamp, DocumentReference, enableNetwork, DocumentSnapshot, QuerySnapshot } from "firebase/firestore";
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
  } catch (error: any) {
    console.error("Login failed", error);
    
    if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`DOMAIN ERROR: You must add "${domain}" to the Authorized Domains list in your Firebase Console (Authentication > Settings).`);
    } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Login cancelled.");
    } else {
        throw new Error("Login failed: " + error.message);
    }
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

// SIMPLIFIED CONNECTION CHECK
// We no longer block actions based on this. It's just for the UI status dot.
export const checkDbConnection = async (): Promise<boolean> => {
    try {
        // Just checking if online navigator status is true
        return navigator.onLine;
    } catch (e) {
        return false;
    }
};

// Database Services
interface CreatePasteParams extends Omit<PasteData, 'id' | 'createdAt' | 'views' | 'expiresAt' | 'durationLabel'> {
    durationInMinutes: number; // -1 for forever
    durationLabel: string;
}

export const createPaste = async (data: CreatePasteParams) => {
    let expiresAt = null;
    
    // Explicitly handle duration logic
    if (data.durationInMinutes > 0) {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + data.durationInMinutes * 60000);
        expiresAt = Timestamp.fromDate(expiryDate);
    }

    const docData = {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        isPrivate: data.isPrivate,
        type: data.type,
        durationLabel: data.durationLabel,
        expiresAt: expiresAt,
        createdAt: serverTimestamp(),
        views: 0
    };

    try {
        // DIRECT CALL - No strict timeouts, no retry loops. 
        // Let Firebase SDK handle the connection naturally.
        const docRef = await addDoc(collection(db, "pastes"), docData);
        return docRef.id;
    } catch (error: any) {
        console.error("Error creating paste", error);
        
        // Detailed Error Analysis
        if (error.code === 'permission-denied') {
            throw new Error("CRITICAL: Database Locked. Go to Firebase Console -> Firestore Database -> Rules and change 'allow read, write: if false' to 'if true'.");
        }
        if (error.code === 'unavailable') {
             throw new Error("NETWORK: Firebase is unreachable. Check if your firewall is blocking Google services.");
        }
        throw error;
    }
};

export const getPaste = async (id: string) => {
  try {
    const docRef = doc(db, "pastes", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Fire and forget view increment
      updateDoc(docRef, { views: increment(1) }).catch(() => {});
      return { id: docSnap.id, ...docSnap.data() } as PasteData;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching paste", error);
    if (error.code === 'permission-denied') {
        throw new Error("CRITICAL: Database Locked. Update Firestore Rules in Console.");
    }
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
    
    return pastes.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
    });
  } catch (error: any) {
    console.error("Error fetching user pastes", error);
    // Don't throw here, just return empty to not break dashboard
    return [];
  }
};