
'use client';

import { useState, useEffect } from 'react';
import { useForm, useForm as useContactForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MoreHorizontal, User, Mail, Phone, Loader2, Trash2, Edit, Home, Milestone, CalendarIcon, Globe, Clock } from 'lucide-react';

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
import { addClient, getClients, updateClient, deleteClient, sendEmail } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';


const clientSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format." }).optional().or(z.literal('')),
  appointmentDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "Datetime must be in YYYY-MM-DDTHH:mm format."}).optional().or(z.literal('')),
});

const contactSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
});

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeletingDialogOpen, setIsDeletingDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [contactingClient, setContactingClient] = useState<Client | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchClients() {
      if (!user) {
        setIsFetching(false);
        return;
      };
      try {
        const fetchedClients = await getClients(user.uid);
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
  }, [user, toast]);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      nationality: '',
      dateOfBirth: '',
      appointmentDateTime: '',
    },
  });
  
  const contactForm = useContactForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    if (editingClient) {
      form.reset({
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone || '',
        address: editingClient.address || '',
        postalCode: editingClient.postalCode || '',
        nationality: editingClient.nationality || '',
        dateOfBirth: editingClient.dateOfBirth || '',
        appointmentDateTime: editingClient.appointmentDateTime ? editingClient.appointmentDateTime.substring(0, 16) : '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        nationality: '',
        dateOfBirth: '',
        appointmentDateTime: '',
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
  
  const handleContactClientClick = (client: Client) => {
    setContactingClient(client);
    contactForm.reset();
    setIsContactDialogOpen(true);
  };


  async function onSubmit(values: z.infer<typeof clientSchema>) {
    if (!user) {
       toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage clients.',
      });
      return;
    }
    setIsLoading(true);

    const clientData: Omit<Client, 'id' | 'status' | 'userId'> & { id?: string } = {
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      address: values.address || undefined,
      postalCode: values.postalCode || undefined,
      nationality: values.nationality || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      appointmentDateTime: values.appointmentDateTime ? `${values.appointmentDateTime}:00.000Z` : undefined,
    };


    try {
      if (editingClient) {
        const updatedClient = { ...editingClient, ...clientData };
        await updateClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        toast({ title: 'Success!', description: 'Client has been updated.' });
      } else {
        const newClientId = await addClient(clientData, user.uid);
        const newClient: Client = { 
          id: newClientId, 
          ...clientData,
          status: 'Active', 
          userId: user.uid,
        };
        setClients(prev => [newClient, ...prev]);
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
  
  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    if (!contactingClient) return;
    setIsSendingEmail(true);

    try {
      await sendEmail(contactingClient.email, values.subject, values.message);
      toast({
        title: 'Email Queued!',
        description: 'Your email has been queued for sending.',
      });
      setIsContactDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Email',
        description: 'Could not queue the email. Please check the setup and try again.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  }


  const TableSkeleton = () => (
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
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
                <TableHead className="hidden md:table-cell">Appointment</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
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
                           <TableCell className="hidden md:table-cell">
                            {client.appointmentDateTime ? 
                                `${format(new Date(client.appointmentDateTime), 'PP')} @ ${format(new Date(client.appointmentDateTime), 'HH:mm')}` 
                                : 'N/A'
                            }
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{client.address || 'N/A'}</TableCell>
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
                                       <DropdownMenuItem onSelect={() => handleContactClientClick(client)}>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Contact
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => handleEditClientClick(client)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
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
                          <TableCell colSpan={7} className="text-center h-24">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update the details for this client.' : 'Fill in the details below to add a new client.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Address (Optional)</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="123 Main St, Anytown" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code (Optional)</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Milestone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="12345" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality (Optional)</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="American" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth (Optional)</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input type="date" placeholder="YYYY-MM-DD" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentDateTime"
                render={({ field }) => (
                   <FormItem>
                    <FormLabel>Appointment Time (Optional)</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input type="datetime-local" placeholder="YYYY-MM-DDTHH:mm" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <DialogFooter className="pt-4">
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
      
      {/* Contact Client Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact {contactingClient?.name}</DialogTitle>
            <DialogDescription>
              Compose your email below. It will be sent from your configured Firebase account.
            </DialogDescription>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium">To:</p>
                <p className="text-sm text-muted-foreground">{contactingClient?.email}</p>
              </div>
              <FormField
                control={contactForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Regarding your appointment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSendingEmail}>
                  {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send Email
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
