import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, doc, query, where, getDocs, serverTimestamp, updateDoc, increment, Timestamp, DocumentReference, enableNetwork, disableNetwork, DocumentSnapshot } from "firebase/firestore";
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

// Helper for timeouts
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(reason => {
                clearTimeout(timer);
                reject(reason);
            });
    });
};

// Connection Checker
export const checkDbConnection = async (): Promise<boolean> => {
    try {
        // Simple timeout check to see if we can reach the server
        // We simulate a network toggle to ensure we aren't in a stale state
        await enableNetwork(db);
        return true;
    } catch (e) {
        console.error("Connection check failed", e);
        return false;
    }
};

// Database Services
interface CreatePasteParams extends Omit<PasteData, 'id' | 'createdAt' | 'views' | 'expiresAt' | 'durationLabel'> {
    durationInMinutes: number; // -1 for forever
    durationLabel: string;
}

export const createPaste = async (data: CreatePasteParams) => {
  try {
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

    // Use a stricter timeout (8 seconds) to prevent infinite "Encrypting..." state
    const docRef = await withTimeout<DocumentReference>(
        addDoc(collection(db, "pastes"), docData), 
        8000, 
        "Network Timeout: Server took too long to respond. Please check your internet."
    );
    
    return docRef.id;
  } catch (error: any) {
    console.error("Error creating paste", error);
    // Return clearer errors
    if (error.code === 'permission-denied') {
        throw new Error("Access Denied: You do not have permission to write to the database.");
    }
    throw error;
  }
};

export const getPaste = async (id: string) => {
  try {
    const docRef = doc(db, "pastes", id);
    // 5 Second timeout for reads
    const docSnap = await withTimeout<DocumentSnapshot>(
        getDoc(docRef),
        5000,
        "Slow connection: Could not retrieve key."
    );
    
    if (docSnap.exists()) {
      // Increment view count silently
      updateDoc(docRef, {
        views: increment(1)
      }).catch(console.error);

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
    // Sort manually by creation time (Newest First)
    return pastes.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching user pastes", error);
    return [];
  }
};