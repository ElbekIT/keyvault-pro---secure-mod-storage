import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, AuthError } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, doc, query, where, getDocs, serverTimestamp, updateDoc, increment, Timestamp, DocumentReference, enableNetwork, disableNetwork, DocumentSnapshot, QuerySnapshot } from "firebase/firestore";
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

// RETRY HELPER: The secret to 100% reliability
// If Firestore says "Offline", we kick it and try again.
const retryOperation = async <T>(operation: () => Promise<T>, retries = 2): Promise<T> => {
    try {
        return await operation();
    } catch (error: any) {
        const isNetworkError = 
            error.code === 'unavailable' || 
            error.message?.includes('offline') || 
            error.message?.includes('network');

        if (isNetworkError && retries > 0) {
            console.warn(`Network glitch detected. Retrying... (${retries} attempts left)`);
            
            // Force reconnect
            try { await enableNetwork(db); } catch(e) {}
            
            // Wait 1 second before retry
            await new Promise(r => setTimeout(r, 1000));
            
            return retryOperation(operation, retries - 1);
        }
        throw error;
    }
};

// ROBUST Connection Checker
export const checkDbConnection = async (): Promise<boolean> => {
    try {
        // 1. Try to ensure network is enabled (don't await strictly, fire and forget)
        enableNetwork(db).catch(() => {});
        
        // 2. Try to fetch a health check doc with a generous timeout for cold starts
        // We use a specific doc path to ensure we are testing reads
        const healthRef = doc(db, "pastes", "_health_check_stub_");
        
        await withTimeout(
            getDoc(healthRef), 
            10000, // 10s timeout
            "Ping Timeout"
        );
        
        return true;
    } catch (e: any) {
        // If permission denied, it means we CONNECTED but were rejected. That counts as "Online".
        if (e.code === 'permission-denied' || e.message?.includes("permission")) return true;
        
        console.warn("Connection check failed (Offline mode active)");
        return false;
    }
};

// Database Services
interface CreatePasteParams extends Omit<PasteData, 'id' | 'createdAt' | 'views' | 'expiresAt' | 'durationLabel'> {
    durationInMinutes: number; // -1 for forever
    durationLabel: string;
}

export const createPaste = async (data: CreatePasteParams) => {
  const operation = async () => {
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

    // Use strict timeout but inside the retry loop
    const docRef = await withTimeout<DocumentReference>(
        addDoc(collection(db, "pastes"), docData), 
        15000, // 15s timeout for writes
        "SERVER TIMEOUT: Could not save data. Internet is too slow."
    );
    
    return docRef.id;
  };

  try {
    return await retryOperation(operation);
  } catch (error: any) {
    console.error("Error creating paste", error);
    if (error.code === 'permission-denied') {
        throw new Error("ACCESS DENIED: Firebase rules are blocking this write.");
    }
    throw error;
  }
};

export const getPaste = async (id: string) => {
  const operation = async () => {
    const docRef = doc(db, "pastes", id);
    const docSnap = await withTimeout<DocumentSnapshot>(
        getDoc(docRef),
        15000,
        "Slow connection: Could not retrieve key."
    );
    
    if (docSnap.exists()) {
      // Fire and forget view increment
      updateDoc(docRef, { views: increment(1) }).catch(() => {});
      return { id: docSnap.id, ...docSnap.data() } as PasteData;
    } else {
      return null;
    }
  };

  try {
    return await retryOperation(operation);
  } catch (error) {
    console.error("Error fetching paste", error);
    throw error;
  }
};

export const getUserPastes = async (uid: string) => {
  const operation = async () => {
    const q = query(collection(db, "pastes"), where("authorId", "==", uid));
    const querySnapshot = await withTimeout<QuerySnapshot>(
        getDocs(q),
        15000,
        "Could not load dashboard."
    );
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
  };

  try {
    return await retryOperation(operation);
  } catch (error) {
    console.error("Error fetching user pastes", error);
    return [];
  }
};