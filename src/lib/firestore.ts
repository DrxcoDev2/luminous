import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Client } from '@/types/client';

// Define the type for the data being added to Firestore, excluding the id
type AddClientData = Omit<Client, 'id' | 'status' | 'userId' | 'createdAt'>;

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
            // Ensure createdAt is a Timestamp object, handle potential nulls
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(0, 0);
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
        // Exclude id from the data to be updated
        const { id, ...dataToUpdate } = clientData;
        
        await updateDoc(clientRef, dataToUpdate as { [x: string]: any });
    } catch (e) {
        console.error('Error updating document: ', e);
        throw new Error('Could not update client');
    }
};

// Function to delete a client from the 'clients' collection
export const deleteClient = async (clientId: string) => {
    try {
        await deleteDoc(doc(db, 'clients', clientId));
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Could not delete client');
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
