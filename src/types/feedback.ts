
import type { Timestamp } from 'firebase/firestore';

export interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  userEmail: string;
  createdAt: Timestamp | Date;
}
