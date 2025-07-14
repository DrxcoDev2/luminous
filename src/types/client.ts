
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  userId: string;
  address?: string;
  postalCode?: string;
  nationality?: string;
  dateOfBirth?: string; // Storing as ISO string e.g., "YYYY-MM-DD"
  appointmentDateTime?: string; // Storing as ISO string
}
