import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Client } from '@/types/client';
import type { ClientNote } from '@/types/client-note';

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
