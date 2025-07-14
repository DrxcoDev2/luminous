
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/types/client';
import { useAuth } from '@/contexts/auth-context';
import { getClients } from '@/lib/firestore';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const fetchedClients = await getClients(user.uid);
        setClients(fetchedClients);
      } catch (error) {
        console.error("Failed to fetch clients for dashboard", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClients();
  }, [user]);

  const nextAppointment = useMemo(() => {
    const now = new Date();
    const upcoming = clients
      .filter(c => c.appointmentDateTime && parseISO(c.appointmentDateTime) > now)
      .sort((a, b) => new Date(a.appointmentDateTime!).getTime() - new Date(b.appointmentDateTime!).getTime());
    return upcoming[0];
  }, [clients]);

  const WelcomeCard = () => (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!</CardTitle>
        <CardDescription>
          Here's a quick overview of your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <p>You can quickly access your clients and calendar from here.</p>
      </CardContent>
    </Card>
  );

  const TotalClientsCard = () => (
    <Link href="/dashboard/clients" className="block group">
      <Card className="h-full flex flex-col justify-between hover:bg-accent transition-colors">
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle className="text-xl">Total Clients</CardTitle>
             <Users className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-1/3" />
          ) : (
            <p className="text-4xl font-bold">{clients.length}</p>
          )}
          <div className="flex items-center text-sm text-muted-foreground mt-4 group-hover:text-primary">
            View all clients
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const CalendarCard = () => (
    <Link href="/dashboard/calendar" className="block group">
       <Card className="lg:col-span-2 h-full flex flex-col justify-between hover:bg-accent transition-colors">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Calendar</CardTitle>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardDescription>
            {nextAppointment ? "Your next appointment is:" : "No upcoming appointments."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : nextAppointment ? (
            <div>
              <p className="font-semibold text-lg">{nextAppointment.name}</p>
              <p className="text-muted-foreground">
                {format(parseISO(nextAppointment.appointmentDateTime!), 'PPPPp')}
              </p>
            </div>
          ) : (
             <p className="text-muted-foreground">Click to view your calendar.</p>
          )}
           <div className="flex items-center text-sm text-muted-foreground mt-4 group-hover:text-primary">
            Go to calendar
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-[180px]">
        <WelcomeCard />
        <TotalClientsCard />
        <CalendarCard />
      </div>
    </div>
  );
}
