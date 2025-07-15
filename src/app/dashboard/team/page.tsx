
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  findUserByEmail,
  getTeam,
  createTeam,
  addTeamMember,
  removeTeamMember,
} from '@/lib/firestore';
import { getUserSettings, saveUserSettings } from '@/lib/user-settings';
import type { TeamMember } from '@/types/team';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, UserPlus, UserX, Crown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Skeleton } from '@/components/ui/skeleton';

const searchSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<TeamMember | null>(null);
  const [userToRemove, setUserToRemove] = useState<TeamMember | null>(null);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { email: '' },
  });

  const isOwner = teamId ? teamMembers.find(m => m.uid === user?.uid)?.role === 'owner' : true;

  useEffect(() => {
    async function loadTeam() {
      if (!user) return;
      setIsLoading(true);
      try {
        const settings = await getUserSettings(user.uid);
        if (settings?.teamId) {
          const team = await getTeam(settings.teamId);
          setTeamMembers(team.members);
          setTeamId(team.id);
        }
      } catch (error) {
        // If team not found, it's not a critical error, just means user has no team.
        if (!(error instanceof Error && error.message.includes('Team not found'))) {
          toast({
            variant: 'destructive',
            title: 'Error loading team',
            description: 'Could not fetch your team information. Please try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadTeam();
  }, [user, toast]);

  async function onSearch(values: z.infer<typeof searchSchema>) {
    setIsSearching(true);
    setSearchedUser(null);
    try {
      if (values.email === user?.email) {
        toast({ variant: 'destructive', title: 'You cannot add yourself to the team.' });
        return;
      }

      if (teamMembers.some(member => member.email === values.email)) {
          toast({ variant: 'destructive', title: 'User is already in the team.' });
          return;
      }
      
      const foundUser = await findUserByEmail(values.email);
      if (foundUser) {
        setSearchedUser(foundUser);
      } else {
        toast({ variant: 'destructive', title: 'User not found', description: 'No user exists with that email address.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Search failed', description: 'An error occurred while searching for the user.' });
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddMember() {
    if (!user || !searchedUser) return;
    setIsAdding(true);
    try {
      let currentTeamId = teamId;
      if (!currentTeamId) {
        // Create a new team if one doesn't exist
        const newTeamId = await createTeam(user.uid, user.email || '', user.displayName || 'Owner');
        await saveUserSettings(user.uid, { teamId: newTeamId });
        setTeamId(newTeamId);
        currentTeamId = newTeamId;
        // Add owner to the team members list visually
        setTeamMembers([{ uid: user.uid, email: user.email!, name: user.displayName || 'Owner', role: 'owner' }]);
      }

      await addTeamMember(currentTeamId!, searchedUser);
      await saveUserSettings(searchedUser.uid, { teamId: currentTeamId! });
      
      setTeamMembers(prev => [...prev, { ...searchedUser, role: 'member' }]);
      setSearchedUser(null);
      form.reset();
      toast({ title: 'Success!', description: `${searchedUser.name || searchedUser.email} has been added to the team.` });

    } catch {
      toast({ variant: 'destructive', title: 'Failed to add member', description: 'An error occurred. Please try again.' });
    } finally {
      setIsAdding(false);
    }
  }

  function confirmRemoveMember(member: TeamMember) {
    setUserToRemove(member);
  }

  async function handleRemoveMember() {
    if (!teamId || !userToRemove) return;
    setIsRemoving(userToRemove.uid);
    try {
      await removeTeamMember(teamId, userToRemove.uid);
       await saveUserSettings(userToRemove.uid, { teamId: null });
      setTeamMembers(prev => prev.filter(m => m.uid !== userToRemove.uid));
      toast({ title: 'Success!', description: `${userToRemove.name || userToRemove.email} has been removed from the team.` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to remove member', description: 'An error occurred. Please try again.' });
    } finally {
      setIsRemoving(null);
      setUserToRemove(null);
    }
  }

  const TeamMemberSkeleton = () => (
      <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
              </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
      </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Manage Your Team</CardTitle>
          <CardDescription>
            Add or remove members from your team. Members can view and manage clients and appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSearch)} className="flex items-start gap-2 mb-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member's email address" {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSearching || !isOwner}>
                {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </form>
          </Form>

          {searchedUser && (
            <Card className="mb-6 bg-accent">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  <div>
                    <p className="font-semibold">{searchedUser.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{searchedUser.email}</p>
                  </div>
                </div>
                <Button onClick={handleAddMember} disabled={isAdding}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Add to Team
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
            {isLoading ? (
                <>
                 <TeamMemberSkeleton />
                 <TeamMemberSkeleton />
                </>
            ) : teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <div key={member.uid} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {member.role === 'owner' ? (
                    <div className="flex items-center gap-2 text-sm text-yellow-500 font-medium">
                      <Crown className="h-4 w-4" />
                      <span>Owner</span>
                    </div>
                  ) : isOwner ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => confirmRemoveMember(member)}
                      disabled={!!isRemoving}
                    >
                      {isRemoving === member.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                    </Button>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                You haven&apos;t added any team members yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {userToRemove?.name || userToRemove?.email} from your team. They will lose access to all team data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} disabled={!!isRemoving} className="bg-destructive hover:bg-destructive/90">
                {isRemoving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
                Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
