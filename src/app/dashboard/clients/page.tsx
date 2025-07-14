
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MoreHorizontal, User, Mail, Phone, Loader2, Trash2, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Client } from '@/types/client';
import { addClient, getClients, updateClient, deleteClient } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const clientSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(),
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeletingDialogOpen, setIsDeletingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchClients() {
      try {
        const fetchedClients = await getClients();
        setClients(fetchedClients);
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Could not fetch clients. Please try again later.',
        });
      } finally {
        setIsFetching(false);
      }
    }
    fetchClients();
  }, [toast]);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (editingClient) {
      form.reset({
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
      });
    }
  }, [editingClient, form]);

  const handleAddNewClientClick = () => {
    setEditingClient(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClientClick = (client: Client) => {
    setEditingClient(client);
    setIsFormDialogOpen(true);
  };
  
  const handleDeleteClientClick = (client: Client) => {
    setDeletingClient(client);
    setIsDeletingDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof clientSchema>) {
    setIsLoading(true);
    try {
      if (editingClient) {
        const updatedClient = { ...editingClient, ...values };
        await updateClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        toast({ title: 'Success!', description: 'Client has been updated.' });
      } else {
        const newClientId = await addClient(values);
        const newClient: Client = { id: newClientId, ...values, status: 'Active' };
        setClients(prev => [...prev, newClient]);
        toast({ title: 'Success!', description: 'New client has been added.' });
      }
      setIsFormDialogOpen(false);
      setEditingClient(null);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: `Could not ${editingClient ? 'update' : 'add'} the client. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingClient) return;
    setIsLoading(true);
    try {
      await deleteClient(deletingClient.id);
      setClients(clients.filter(c => c.id !== deletingClient.id));
      toast({ title: 'Success!', description: 'Client has been deleted.' });
      setIsDeletingDialogOpen(false);
      setDeletingClient(null);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not delete the client. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }


  const TableSkeleton = () => (
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Clients</CardTitle>
              <CardDescription>Manage your clients here.</CardDescription>
            </div>
            <Button onClick={handleAddNewClientClick}>
              <PlusCircle className="mr-2" />
              Add New Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            {isFetching ? <TableSkeleton /> : (
              <TableBody>
                  {clients.length > 0 ? clients.map((client) => (
                      <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{client.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button aria-haspopup="true" size="icon" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu</span>
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onSelect={() => handleEditClientClick(client)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => handleDeleteClientClick(client)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                      </TableRow>
                  )) : (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                              No clients yet. Add one to get started!
                          </TableCell>
                      </TableRow>
                  )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Client Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={open => {
        setIsFormDialogOpen(open);
        if (!open) setEditingClient(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update the details for this client.' : 'Fill in the details below to add a new client.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                       <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="John Doe" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="name@example.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="123-456-7890" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {editingClient ? 'Update Client' : 'Add Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
       {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeletingDialogOpen} onOpenChange={setIsDeletingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              "{deletingClient?.name}" and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingClient(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
