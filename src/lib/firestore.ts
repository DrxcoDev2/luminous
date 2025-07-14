import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import type { Client } from '@/types/client';

// Define the type for the data being added to Firestore, excluding the id
type AddClientData = Omit<Client, 'id' | 'status' | 'userId'>;

// Function to add a new client to the 'clients' collection
export const addClient = async (clientData: AddClientData, userId: string) => {
  try {
    const dataWithUserAndTimestamp: any = {
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
            clients.push({ id: doc.id, ...doc.data() } as Client);
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
