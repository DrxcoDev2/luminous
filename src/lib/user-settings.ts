
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserSettings } from '@/types/user-settings';
import type { User } from 'firebase/auth';

/**
 * Fetches the settings for a given user.
 * @param userId - The ID of the user whose settings are to be fetched.
 * @returns The user's settings object, or null if not found.
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const docRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserSettings;
    }
    return null;
  } catch (e) {
    console.error('Error getting user settings: ', e);
    throw new Error('Could not fetch user settings');
  }
};

/**
 * Saves or updates the settings for a given user.
 * Using setDoc with the userId as the document ID creates a single, predictable
 * document for each user's settings.
 * @param userId - The ID of the user.
 * @param settings - The settings object to save.
 */
export const saveUserSettings = async (userId: string, settings: Partial<Omit<UserSettings, 'id'>>) => {
  try {
    const docRef = doc(db, 'userSettings', userId);
    // Use setDoc with { merge: true } to create or update the document
    await setDoc(docRef, settings, { merge: true });
  } catch (e) {
    console.error('Error saving user settings: ', e);
    throw new Error('Could not save user settings');
  }
};


/**
 * Ensures a user document exists in userSettings collection after social login.
 * This is crucial for making users searchable for team invitations.
 * @param user - The Firebase Auth User object after a successful sign-in.
 */
export const ensureUserSettings = async (user: User) => {
    const settingsRef = doc(db, 'userSettings', user.uid);
    const docSnap = await getDoc(settingsRef);

    if (!docSnap.exists()) {
        await setDoc(settingsRef, {
            userId: user.uid,
            name: user.displayName,
            email: user.email,
        }, { merge: true });
    }
}
