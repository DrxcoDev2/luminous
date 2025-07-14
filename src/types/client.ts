
import type { Timestamp } from 'firebase/firestore';
import type { ClientNote } from './client-note';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  userId: string; // The user who created the client
  teamId?: string | null; // The team this client belongs to
  address?: string;
  postalCode?: string;
  nationality?: string;
  dateOfBirth?: string; // Storing as ISO string e.g., "YYYY-MM-DD"
  appointmentDateTime?: string; // Storing as ISO string
  interests?: string[]; // Array of interest tags
  createdAt: Timestamp;
  notes?: ClientNote[]; // Notes will be loaded on demand into this optional array
}

    
