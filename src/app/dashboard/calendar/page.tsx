
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { Client } from '@/types/client';
import { useAuth } from '@/contexts/auth-context';
import { getClients } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDays, format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    async function fetchClientsWithAppointments() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const allClients = await getClients(user.uid);
        const clientsWithAppointments = allClients.filter(client => client.appointmentDateTime);
        setClients(clientsWithAppointments);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Could not fetch appointments. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchClientsWithAppointments();
  }, [user, toast]);

  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Client[] } = {};
    clients.forEach(client => {
      if (client.appointmentDateTime) {
        const date = format(parseISO(client.appointmentDateTime), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(client);
        grouped[date].sort((a, b) => new Date(a.appointmentDateTime!).getTime() - new Date(b.appointmentDateTime!).getTime());
      }
    });
    return grouped;
  }, [clients]);

  const appointmentDates = useMemo(() => {
    return Object.keys(appointmentsByDate).map(dateStr => addDays(new Date(dateStr),0));
  }, [appointmentsByDate]);

  const selectedDayAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return appointmentsByDate[dateKey] || [];
  }, [selectedDate, appointmentsByDate]);

  return (
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Calendar</CardTitle>
          <CardDescription>
            Here are your upcoming client appointments. Click on a day to see details.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {isLoading ? (
            <Skeleton className="w-full max-w-md h-[350px] rounded-lg" />
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ scheduled: appointmentDates }}
              modifiersStyles={{
                scheduled: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="rounded-md border self-center"
            />
          )}
          
          <Separator className="my-8" />
          
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">
              Appointments for {selectedDate ? format(selectedDate, 'PPP') : '...'}
            </h3>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                   <div key={i} className="flex items-center gap-4 p-2 rounded-lg border">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                      </div>
                   </div>
                ))}
              </div>
            ) : selectedDayAppointments.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedDayAppointments.map(client => (
                  <div key={client.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                    <Avatar className="h-10 w-10">
                       <AvatarImage src={`https://placehold.co/100x100.png?text=${client.name.charAt(0)}`} />
                       <AvatarFallback><UserCircle /></AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(parseISO(client.appointmentDateTime!), 'p')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground pt-4 text-center">
                No appointments scheduled for this day.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
