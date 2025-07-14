import type { Timestamp } from 'firebase/firestore';

export interface ClientNote {
  id: string;
  text: string;
  createdAt: Timestamp;
  userId: string;
}
