
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useForm as useContactForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MoreHorizontal, User, Mail, Phone, Loader2, Trash2, Edit, Home, Milestone, CalendarIcon, Globe, Clock, Info, Send, Heart } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
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
import type { ClientNote } from '@/types/client-note';
import { addClient, getClients, updateClient, deleteClient, sendEmail, addNote, getNotes, deleteNote } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { parseISO } from 'date-fns';
import { format as formatTZ, toZonedTime } from 'date-fns-tz';
import { Textarea } from '@/components/ui/textarea';
import { getUserSettings } from '@/lib/user-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';


const interests = [
  { id: 'services', label: 'Services' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'customers', label: 'Customers' },
  { id: 'learning', label: 'Learning' },
  { id: 'promotion', label: 'Promotion' },
  { id: 'mentoring', label: 'Mentoring' },
] as const;

const clientSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format." }).optional().or(z.literal('')),
  appointmentDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "Datetime must be in YYYY-MM-DDTHH:mm format."}).optional().or(z.literal('')),
  interests: z.array(z.string()).optional(),
});

const contactSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
});

const noteSchema = z.object({
  note: z.string().min(1, { message: 'Note cannot be empty.' }).max(500, { message: 'Note cannot exceed 500 characters.' }),
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [contactingClient, setContactingClient] = useState<Client | null>(null);
  const [timezone, setTimezone] = useState('UTC');
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchClients() {
      if (!user) {
        setIsFetching(false);
        return;
      };
      try {
        const [fetchedClients, settings] = await Promise.all([
            getClients(user.uid),
            getUserSettings(user.uid)
        ]);
        if(settings?.timezone) {
            setTimezone(settings.timezone);
        }
        setClients(fetchedClients);
      } catch {
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
    defaultValues: { name: '', email: '', phone: '', address: '', postalCode: '', nationality: '', dateOfBirth: '', appointmentDateTime: '', interests: [] },
  });
  
  const contactForm = useContactForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: '', message: '' },
  });
  
  const noteForm = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: '' },
  });

  const formatInTimezone = useCallback((date: Date | string, fmt: string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatTZ(toZonedTime(dateObj, timezone), fmt, { timeZone: timezone });
  }, [timezone]);


  const fetchNotes = useCallback(async (clientId: string) => {
    setIsFetchingNotes(true);
    try {
      const fetchedNotes = await getNotes(clientId);
      setNotes(fetchedNotes);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch client notes.' });
    } finally {
      setIsFetchingNotes(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedClient) {
      form.reset({
        name: selectedClient.name,
        email: selectedClient.email,
        phone: selectedClient.phone || '',
        address: selectedClient.address || '',
        postalCode: selectedClient.postalCode || '',
        nationality: selectedClient.nationality || '',
        dateOfBirth: selectedClient.dateOfBirth || '',
        appointmentDateTime: selectedClient.appointmentDateTime ? formatInTimezone(selectedClient.appointmentDateTime, "yyyy-MM-dd'T'HH:mm") : '',
        interests: selectedClient.interests || [],
      });
      fetchNotes(selectedClient.id);
    } else {
      form.reset({ name: '', email: '', phone: '', address: '', postalCode: '', nationality: '', dateOfBirth: '', appointmentDateTime: '', interests: [] });
      setNotes([]);
    }
  }, [selectedClient, form, formatInTimezone, fetchNotes]);

  const handleAddNewClientClick = () => {
    setSelectedClient(null);
    setIsFormDialogOpen(true);
  };

  const handleEditOrViewClientClick = (client: Client) => {
    setSelectedClient(client);
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
    if (!user) return toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to manage clients.' });
    setIsLoading(true);

    const clientData = {
      name: values.name, email: values.email, phone: values.phone || undefined,
      address: values.address || undefined, postalCode: values.postalCode || undefined,
      nationality: values.nationality || undefined, dateOfBirth: values.dateOfBirth || undefined,
      appointmentDateTime: values.appointmentDateTime ? values.appointmentDateTime : undefined,
      interests: values.interests || [],
    };

    try {
      if (selectedClient) {
        const updatedClient = { ...selectedClient, ...clientData };
        await updateClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        toast({ title: 'Success!', description: 'Client has been updated.' });
      } else {
        const newClientId = await addClient(clientData, user.uid);
        const newClient: Client = { id: newClientId, ...clientData, status: 'Active', userId: user.uid, createdAt: Timestamp.now() };
        setClients(prev => [newClient, ...prev]);
        toast({ title: 'Success!', description: 'New client has been added.' });
      }
      setIsFormDialogOpen(false);
      setSelectedClient(null);
      form.reset();
    } catch {
      toast({ variant: 'destructive', title: 'Uh oh! Something went wrong.', description: `Could not ${selectedClient ? 'update' : 'add'} the client. Please try again.` });
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
    } catch {
       toast({ variant: 'destructive', title: 'Uh oh! Something went wrong.', description: 'Could not delete the client. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    if (!contactingClient) return;
    setIsSendingEmail(true);
    try {
      await sendEmail(contactingClient.email, values.subject, values.message);
      toast({ title: 'Email Queued!', description: 'Your email has been queued for sending.' });
      setIsContactDialogOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to Send Email', description: 'Could not queue the email. Please check the setup and try again.' });
    } finally {
      setIsSendingEmail(false);
    }
  }

  async function onNoteSubmit(values: z.infer<typeof noteSchema>) {
    if (!selectedClient || !user) return;
    setIsAddingNote(true);
    try {
      const newNoteId = await addNote(selectedClient.id, values.note, user.uid);
      const newNote = await getNotes(selectedClient.id).then(notes => notes.find(n => n.id === newNoteId)!);
      setNotes(prev => [newNote, ...prev]);
      noteForm.reset();
      toast({ title: 'Success!', description: 'Note added.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add note.' });
    } finally {
      setIsAddingNote(false);
    }
  }
  
  async function handleDeleteNote(noteId: string) {
    if (!selectedClient) return;
    setIsDeletingNote(noteId);
    try {
      await deleteNote(selectedClient.id, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast({ title: 'Success!', description: 'Note deleted.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete note.' });
    } finally {
      setIsDeletingNote(null);
    }
  }

  const TableSkeleton = () => (
    <div className="space-y-4 md:hidden">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 space-y-3">
          <div className="flex justify-between items-center">
             <Skeleton className="h-5 w-32" /> <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-48" /></div>
            <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-24" /></div>
            <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-36" /></div>
          </div>
        </Card>
      ))}
    </div>
  );
  
  const TableSkeletonDesktop = () => (
     <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

  const ClientActions = ({ client }: { client: Client}) => (
     <DropdownMenu>
        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => handleContactClientClick(client)}><Mail className="mr-2 h-4 w-4" />Contact</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleEditOrViewClientClick(client)}><Edit className="mr-2 h-4 w-4" />Edit Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleDeleteClientClick(client)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><CardTitle className="text-2xl">Clients</CardTitle><CardDescription>Manage your clients here.</CardDescription></div>
            <Button onClick={handleAddNewClientClick} className="w-full sm:w-auto"><PlusCircle className="mr-2" />Add New Client</Button>
          </div>
        </CardHeader>
        <CardContent>
           <div className="md:hidden">
             {isFetching ? <TableSkeleton /> : (
                <div className="space-y-4">
                  {clients.length > 0 ? clients.map((client) => (
                    <Card key={client.id} className="p-4">
                       <div className="flex justify-between items-start">
                         <div>
                            <h3 className="font-semibold text-lg">{client.name}</h3>
                            <Badge variant={client.status === 'Active' ? 'default' : 'secondary'} className="mt-1">{client.status}</Badge>
                         </div>
                         <ClientActions client={client} />
                       </div>
                       <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{client.email}</span></div>
                          {client.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{client.phone}</span></div>}
                          {client.address && <div className="flex items-center gap-2"><Home className="h-4 w-4" /><span>{client.address}</span></div>}
                           {client.appointmentDateTime && <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /><span>{`${formatInTimezone(client.appointmentDateTime, 'PP')} @ ${formatInTimezone(client.appointmentDateTime, 'HH:mm')}`}</span></div>}
                       </div>
                       {client.interests && client.interests.length > 0 && (
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                             {client.interests.map(interestId => {
                                const interest = interests.find(i => i.id === interestId);
                                return interest ? <Badge key={interest.id} variant="secondary">{interest.label}</Badge> : null;
                             })}
                        </div>
                       )}
                    </Card>
                  )) : ( <div className="text-center h-24 flex items-center justify-center"><p>No clients yet. Add one to get started!</p></div> )}
                </div>
             )}
           </div>

          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Appointment</TableHead>
                  <TableHead className="hidden xl:table-cell">Interests</TableHead>
                  <TableHead>Info</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              {isFetching ? <TableSkeletonDesktop /> : (
                <TableBody>
                    {clients.length > 0 ? clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{client.phone || 'N/A'}</TableCell>
                             <TableCell className="hidden lg:table-cell">{client.appointmentDateTime ? `${formatInTimezone(client.appointmentDateTime, 'PP')} @ ${formatInTimezone(client.appointmentDateTime, 'HH:mm')}` : 'N/A'}</TableCell>
                            <TableCell className="hidden xl:table-cell">
                                <div className="flex flex-wrap gap-1">
                                    {client.interests && client.interests.length > 0 ? client.interests.map(interestId => {
                                        const interest = interests.find(i => i.id === interestId);
                                        return interest ? <Badge key={interest.id} variant="secondary">{interest.label}</Badge> : null;
                                    }) : 'N/A'}
                                </div>
                            </TableCell>
                            <TableCell><Button variant="ghost" size="icon" onClick={() => handleEditOrViewClientClick(client)}><Info className="h-4 w-4" /></Button></TableCell>
                            <TableCell><ClientActions client={client} /></TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={7} className="text-center h-24">No clients yet. Add one to get started!</TableCell></TableRow>
                    )}
                </TableBody>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={open => { setIsFormDialogOpen(open); if (!open) setSelectedClient(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedClient ? `Manage: ${selectedClient.name}` : 'Add New Client'}</DialogTitle>
            <DialogDescription>{selectedClient ? 'Update details or add notes for this client.' : 'Fill in the details below to add a new client.'}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes" disabled={!selectedClient}>Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="h-full flex flex-col min-h-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 h-full flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="John Doe" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="name@example.com" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="123-456-7890" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Home Address (Optional)</FormLabel><FormControl><div className="relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="123 Main St, Anytown" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code (Optional)</FormLabel><FormControl><div className="relative"><Milestone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="12345" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nationality (Optional)</FormLabel><FormControl><div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="American" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of birth (Optional)</FormLabel><FormControl><div className="relative"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="date" placeholder="YYYY-MM-DD" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="appointmentDateTime" render={({ field }) => (<FormItem><FormLabel>Appointment Time (Optional)</FormLabel><FormControl><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="datetime-local" placeholder="YYYY-MM-DDTHH:mm" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <FormField
                      control={form.control}
                      name="interests"
                      render={() => (
                        <FormItem className="mt-4 pt-4 border-t col-span-1 md:col-span-2">
                            <div className="mb-4">
                                <FormLabel className="text-base flex items-center gap-2"><Heart className="h-4 w-4"/> Interests</FormLabel>
                                <FormMessage />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {interests.map((item) => (
                                <FormField
                                key={item.id}
                                control={form.control}
                                name="interests"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        {item.label}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                           </div>
                           <div className="mt-4 flex flex-wrap gap-2">
                             {form.watch('interests')?.map(interestId => {
                                const interest = interests.find(i => i.id === interestId);
                                return interest ? <Badge key={interest.id} variant="secondary">{interest.label}</Badge> : null;
                             })}
                           </div>
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                  <DialogFooter className="pt-4 border-t mt-auto">
                    <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedClient ? 'Update Client' : 'Add Client'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="notes" className="h-full flex flex-col">
              <div className="flex-1 min-h-0 py-4">
                 <ScrollArea className="h-full pr-4">
                    {isFetchingNotes ? (
                        <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
                    ) : notes.length > 0 ? (
                        <div className="space-y-4">
                            {notes.map(note => (
                                <Card key={note.id} className="bg-muted/50">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm text-foreground whitespace-pre-wrap flex-1 mr-4">{note.text}</p>
                                            <div className="text-right">
                                               <p className="text-xs text-muted-foreground">{formatInTimezone(note.createdAt.toDate(), 'PP')}</p>
                                               <p className="text-xs text-muted-foreground">{formatInTimezone(note.createdAt.toDate(), 'p')}</p>
                                               <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => handleDeleteNote(note.id)} disabled={isDeletingNote === note.id}>
                                                  {isDeletingNote === note.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                               </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground h-full flex items-center justify-center"><p>No notes for this client yet.</p></div>
                    )}
                 </ScrollArea>
              </div>
              <div className="pt-4 border-t">
                 <Form {...noteForm}>
                    <form onSubmit={noteForm.handleSubmit(onNoteSubmit)} className="flex items-start gap-2">
                       <FormField control={noteForm.control} name="note" render={({ field }) => (<FormItem className="flex-1"><FormControl><Textarea placeholder="Add a new note..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                       <Button type="submit" disabled={isAddingNote} size="icon"><span className="sr-only">Add Note</span>{isAddingNote ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button>
                    </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isDeletingDialogOpen} onOpenChange={setIsDeletingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the client &quot;{deletingClient?.name}&quot; and remove their data from our servers.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingClient(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact {contactingClient?.name}</DialogTitle>
            <DialogDescription>Compose your email below. It will be sent from your configured Firebase account.</DialogDescription>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
              <div className="flex items-baseline gap-2"><p className="text-sm font-medium">To:</p><p className="text-sm text-muted-foreground">{contactingClient?.email}</p></div>
              <FormField control={contactForm.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Regarding your appointment" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={contactForm.control} name="message" render={({ field }) => (<FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Type your message here..." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSendingEmail}>{isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}Send Email</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
