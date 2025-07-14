
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, Timestamp, arrayUnion, arrayRemove, getDoc, writeBatch } from 'firebase/firestore';
import type { Client } from '@/types/client';
import type { ClientNote } from '@/types/client-note';
import type { Feedback } from '@/types/feedback';
import type { Team, TeamMember } from '@/types/team';

// Define the type for the data being added to Firestore, excluding the id
type AddClientData = Omit<Client, 'id' | 'status' | 'userId' | 'createdAt' | 'notes'>;

// Function to add a new client to the 'clients' collection
export const addClient = async (clientData: AddClientData, userId: string) => {
  try {
    const dataWithUserAndTimestamp = {
        ...clientData,
        userId,
        status: 'Active',
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'clients'), dataWithUserAndTimestamp);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not add client');
  }
};

// Function to get all clients for a specific user from the 'clients' collection
export const getClients = async (userId: string): Promise<Client[]> => {
    try {
        const q = query(
          collection(db, "clients"), 
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const clients: Client[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now();
            clients.push({ id: doc.id, ...data, createdAt } as Client);
        });
        return clients;
    } catch (e) {
        console.error("Error fetching documents: ", e);
        throw new Error("Could not fetch clients");
    }
};

// Function to update an existing client
export const updateClient = async (clientData: Client) => {
    try {
        const clientRef = doc(db, 'clients', clientData.id);
        const dataToUpdate = { ...clientData };
        delete (dataToUpdate as Partial<Client>).id;
        delete (dataToUpdate as Partial<Client>).notes; // Notes are managed in a subcollection
        
        await updateDoc(clientRef, dataToUpdate);
    } catch (e) {
        console.error('Error updating document: ', e);
        throw new Error('Could not update client');
    }
};

// Function to delete a client from the 'clients' collection
export const deleteClient = async (clientId: string) => {
    try {
        // Here you might also want to delete the notes subcollection, but that requires a more complex function (e.g., a cloud function) to do efficiently and safely. For now, we just delete the client doc.
        await deleteDoc(doc(db, 'clients', clientId));
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Could not delete client');
    }
};

// --- Client Notes Functions ---

// Function to add a new note to a client's 'notes' subcollection
export const addNote = async (clientId: string, text: string, userId: string): Promise<string> => {
    try {
        const notesCollectionRef = collection(db, 'clients', clientId, 'notes');
        const docRef = await addDoc(notesCollectionRef, {
            text,
            userId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error('Error adding note: ', e);
        throw new Error('Could not add note');
    }
};

// Function to get all notes for a specific client
export const getNotes = async (clientId: string): Promise<ClientNote[]> => {
    try {
        const notesCollectionRef = collection(db, 'clients', clientId, 'notes');
        const q = query(notesCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const notes: ClientNote[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now();
            notes.push({ id: doc.id, ...data } as ClientNote);
        });
        return notes;
    } catch (e) {
        console.error('Error fetching notes: ', e);
        throw new Error('Could not fetch notes');
    }
};

// Function to delete a note from a client's 'notes' subcollection
export const deleteNote = async (clientId: string, noteId: string) => {
    try {
        const noteDocRef = doc(db, 'clients', clientId, 'notes', noteId);
        await deleteDoc(noteDocRef);
    } catch (e) {
        console.error('Error deleting note: ', e);
        throw new Error('Could not delete note');
    }
};


// Function to send an email by adding it to the 'mail' collection
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await addDoc(collection(db, 'mail'), {
            to: to,
            message: {
                subject: subject,
                html: html,
            },
        });
    } catch (e) {
        console.error('Error sending email: ', e);
        throw new Error('Could not send email');
    }
};


// --- Feedback Functions ---

export const saveFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
    try {
        await addDoc(collection(db, 'feedback'), {
            ...feedbackData,
            createdAt: serverTimestamp()
        });
    } catch(e) {
        console.error('Error adding feedback: ', e);
        throw new Error('Could not save feedback');
    }
};

export const getFeedback = async (): Promise<Feedback[]> => {
    try {
        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const feedback: Feedback[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now();
            feedback.push({ id: doc.id, ...data, createdAt } as Feedback);
        });
        return feedback;
    } catch (e) {
        console.error("Error fetching feedback: ", e);
        throw new Error("Could not fetch feedback");
    }
}

// --- Team Functions ---

// Function to find a user by their email.
export const findUserByEmail = async (email: string): Promise<TeamMember | null> => {
    try {
        const q = query(collection(db, 'userSettings'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return {
            uid: userDoc.id,
            email: userData.email,
            name: userData.name || '',
            role: 'member',
        };
    } catch (e) {
        console.error("Error finding user by email: ", e);
        throw new Error("Could not find user");
    }
};

// Function to create a new team
export const createTeam = async (ownerUid: string, ownerEmail: string, ownerName: string): Promise<string> => {
    try {
        const teamRef = await addDoc(collection(db, 'teams'), {
            ownerId: ownerUid,
            createdAt: serverTimestamp(),
            members: [
                { uid: ownerUid, email: ownerEmail, name: ownerName, role: 'owner' }
            ],
        });
        return teamRef.id;
    } catch (e) {
        console.error('Error creating team: ', e);
        throw new Error('Could not create team');
    }
};

// Function to get team details
export const getTeam = async (teamId: string): Promise<Team> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const docSnap = await getDoc(teamRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Team;
        }
        throw new Error('Team not found');
    } catch (e) {
        console.error('Error getting team: ', e);
        throw new Error('Could not get team');
    }
};

// Function to add a new member to a team
export const addTeamMember = async (teamId: string, member: TeamMember) => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        await updateDoc(teamRef, {
            members: arrayUnion({ ...member, role: 'member' }),
        });
    } catch (e) {
        console.error('Error adding team member: ', e);
        throw new Error('Could not add team member');
    }
};

// Function to remove a member from a team
export const removeTeamMember = async (teamId: string, memberUid: string) => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamSnap = await getDoc(teamRef);
        if (!teamSnap.exists()) throw new Error('Team not found');
        
        const teamData = teamSnap.data() as Team;
        const memberToRemove = teamData.members.find(m => m.uid === memberUid);

        if (memberToRemove) {
            await updateDoc(teamRef, {
                members: arrayRemove(memberToRemove),
            });
        }
    } catch (e) {
        console.error('Error removing team member: ', e);
        throw new Error('Could not remove team member');
    }
};
