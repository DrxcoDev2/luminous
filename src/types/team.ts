
import type { Timestamp } from 'firebase/firestore';

export interface TeamMember {
  uid: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
}

export interface Team {
  id: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Timestamp;
}
