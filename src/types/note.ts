import type { Timestamp } from 'firebase/firestore';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
}
