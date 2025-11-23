export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface PasteData {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any; // Firestore Timestamp
  isPrivate: boolean;
  views: number;
  type: 'text' | 'json' | 'key';
}

export enum SecurityLevel {
  STANDARD = 'STANDARD',
  ENCRYPTED = 'ENCRYPTED',
  RESTRICTED = 'RESTRICTED'
}