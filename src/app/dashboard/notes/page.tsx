
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MoreHorizontal, Loader2, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Note } from '@/types/note';
import { addNote, getNotes, updateNote, deleteNote, getNote } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';
//import { Timestamp } from 'firebase/firestore';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less.'),
  content: z.string().min(1, 'Content is required'),
});

export default function NotesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', content: '' },
  });

  useEffect(() => {
    async function fetchNotes() {
      if (!user) return setIsFetching(false);
      try {
        const fetchedNotes = await getNotes(user.uid);
        setNotes(fetchedNotes);
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your notes.' });
      } finally {
        setIsFetching(false);
      }
    }
    fetchNotes();
  }, [user, toast]);

  useEffect(() => {
    if (selectedNote) {
      form.reset(selectedNote);
    } else {
      form.reset({ title: '', content: '' });
    }
  }, [selectedNote, form]);

  const handleOpenForm = (note: Note | null = null) => {
    setSelectedNote(note);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleting(true);
  };

  async function onSubmit(values: z.infer<typeof noteSchema>) {
    if (!user) return;
    setIsLoading(true);

    try {
      if (selectedNote) {
        const updatedNote = { ...selectedNote, ...values };
        await updateNote(selectedNote.id, values);
        setNotes(notes.map(n => (n.id === selectedNote.id ? updatedNote : n)));
        toast({ title: 'Success!', description: 'Note updated successfully.' });
      } else {
        const newNoteId = await addNote(values, user.uid);
        const newNote = await getNote(newNoteId);
        if (newNote) {
            setNotes([newNote, ...notes]);
        }
        toast({ title: 'Success!', description: 'Note created successfully.' });
      }
      setIsFormOpen(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Could not ${selectedNote ? 'update' : 'create'} note.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!noteToDelete) return;
    setIsLoading(true);
    try {
      await deleteNote(noteToDelete.id);
      setNotes(notes.filter(n => n.id !== noteToDelete.id));
      toast({ title: 'Success!', description: 'Note deleted.' });
      setIsDeleting(false);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the note.' });
    } finally {
      setIsLoading(false);
      setNoteToDelete(null);
    }
  }

  const NoteCard = ({ note }: { note: Note }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <CardDescription>
          {format(note.createdAt.toDate(), 'PPP p')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{note.content}</p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenForm(note)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenDeleteDialog(note)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );

  const SkeletonCard = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Skeleton className="h-8 w-8" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Notes</h1>
          <p className="text-muted-foreground">A place for your thoughts and reminders.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No notes yet</h3>
          <p className="text-muted-foreground mt-2">Click &quot;Add Note&quot; to create your first one.</p>
        </div>
      )}

      {/* Add/Edit Note Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNote ? 'Edit Note' : 'Add a New Note'}</DialogTitle>
            <DialogDescription>
              {selectedNote ? 'Update your existing note below.' : 'Fill in the details for your new note.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Note title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your note here..." {...field} className="min-h-[150px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedNote ? 'Save Changes' : 'Create Note'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
