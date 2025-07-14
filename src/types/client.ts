
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  userId: string;
}
