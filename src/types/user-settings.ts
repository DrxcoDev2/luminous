
export interface UserSettings {
  id?: string; // The doc ID will be the userId
  userId: string;
  name?: string | null;
  email?: string | null;
  companyName?: string;
  timezone?: string;
  accountType?: 'individual' | 'business';
  notificationHours?: number;
  teamId?: string | null;
}
