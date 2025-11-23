import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, AuthError } from "firebase/auth";
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
  } catch (error: any) {
    console.error("Login failed", error);
    
    // NETLIFY / GITHUB SPECIFIC ERROR HANDLING
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

// REAL Connection Checker (Pings the database)
export const checkDbConnection = async (): Promise<boolean> => {
    try {
        // 1. Ensure network is enabled
        await enableNetwork(db);
        
        // 2. Try to fetch a dummy document with a short timeout. 
        // We don't care if it exists, just that we can talk to the server.
        const healthRef = doc(db, "_health", "ping");
        
        await withTimeout(
            getDoc(healthRef), 
            5000, 
            "Network Ping Timeout"
        );
        
        return true;
    } catch (e: any) {
        console.error("Connection check failed", e);
        // If permission denied, it means we CONNECTED but were rejected. That counts as "Online".
        if (e.code === 'permission-denied') return true;
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

    // Use a stricter timeout (10 seconds)
    const docRef = await withTimeout<DocumentReference>(
        addDoc(collection(db, "pastes"), docData), 
        10000, 
        "SERVER TIMEOUT: The database is not responding. Please check your internet connection."
    );
    
    return docRef.id;
  } catch (error: any) {
    console.error("Error creating paste", error);
    // Return clearer errors
    if (error.code === 'permission-denied') {
        throw new Error("ACCESS DENIED: Firebase rules are blocking this write. Please check Firestore Rules.");
    }
    throw error;
  }
};

export const getPaste = async (id: string) => {
  try {
    const docRef = doc(db, "pastes", id);
    // 8 Second timeout for reads
    const docSnap = await withTimeout<DocumentSnapshot>(
        getDoc(docRef),
        8000,
        "Slow connection: Could not retrieve key."
    );
    
    if (docSnap.exists()) {
      // Increment view count silently, don't await it
      updateDoc(docRef, {
        views: increment(1)
      }).catch(err => console.warn("Could not update view count", err));

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