import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import type { Client } from '@/types/client';

// Define the type for the data being added to Firestore, excluding the id
type AddClientData = Omit<Client, 'id' | 'status'> & {
    createdAt: any;
    status: 'Active' | 'Inactive';
};

// Function to add a new client to the 'clients' collection
export const addClient = async (clientData: Omit<Client, 'id' | 'status'>) => {
  try {
    const dataWithTimestamp: AddClientData = {
        ...clientData,
        status: 'Active',
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'clients'), dataWithTimestamp);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not add client');
  }
};

// Function to get all clients from the 'clients' collection
export const getClients = async (): Promise<Client[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "clients"));
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
