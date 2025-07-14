
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, ArrowRight, Settings, Building, Globe } from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/types/client';
import { useAuth } from '@/contexts/auth-context';
import { getClients } from '@/lib/firestore';
import { format, parseISO, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { format as formatTZ, toZonedTime } from 'date-fns-tz';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getUserSettings } from '@/lib/user-settings';
import type { UserSettings } from '@/types/user-settings';
import { timezones } from '@/lib/timezones';

const chartConfig = {
  clients: {
    label: "New Clients",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function DashboardPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const [fetchedClients, fetchedSettings] = await Promise.all([
            getClients(user.uid),
            getUserSettings(user.uid)
        ]);
        if(fetchedSettings?.timezone) {
            setTimezone(fetchedSettings.timezone);
        }
        setSettings(fetchedSettings);
        setClients(fetchedClients);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [user]);

  const formatInTimezone = (date: Date | string, fmt: string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatTZ(toZonedTime(dateObj, timezone), fmt, { timeZone: timezone });
  };

  const nextAppointment = useMemo(() => {
    const now = new Date();
    const upcoming = clients
      .filter(c => c.appointmentDateTime && parseISO(c.appointmentDateTime) > now)
      .sort((a, b) => new Date(a.appointmentDateTime!).getTime() - new Date(b.appointmentDateTime!).getTime());
    return upcoming[0];
  }, [clients]);
  
  const weeklyClientsData = useMemo(() => {
    const now = new Date();
    const last6Weeks = Array.from({ length: 6 }).map((_, i) => {
      const weekStart = startOfWeek(subWeeks(now, 5 - i));
      return {
        date: format(weekStart, 'MMM d'),
        clients: 0,
      };
    });

    clients.forEach(client => {
      if (client.createdAt) {
        const createdAtDate = client.createdAt.toDate();
        const weekIndex = last6Weeks.findIndex(week => {
            const weekStart = startOfWeek(subWeeks(now, 5 - last6Weeks.indexOf(week)));
            const weekEnd = endOfWeek(subWeeks(now, 5 - last6Weeks.indexOf(week)));
            return createdAtDate >= weekStart && createdAtDate <= weekEnd;
        });

        const currentWeekStart = startOfWeek(now);
        const currentWeekIndex = last6Weeks.length -1;
        if( createdAtDate >= currentWeekStart && createdAtDate <= now) {
            if(last6Weeks[currentWeekIndex]) {
               last6Weeks[currentWeekIndex].clients++;
            }
        } else if (weekIndex !== -1) {
            last6Weeks[weekIndex].clients++;
        }
      }
    });

    return last6Weeks;
  }, [clients]);


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
       <Card className="h-full flex flex-col justify-between hover:bg-accent transition-colors">
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
                {formatInTimezone(nextAppointment.appointmentDateTime!, 'PP HH:mm')}
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

  const SettingsCard = () => {
    const timezoneLabel = timezones.find(tz => tz.value === settings?.timezone)?.label.split('(')[0].trim() || settings?.timezone;
    return (
        <Link href="/dashboard/settings" className="block group">
           <Card className="h-full flex flex-col justify-between hover:bg-accent transition-colors">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Company Settings</CardTitle>
                    <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                 <CardDescription>
                    Your company info and timezone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                         <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 text-sm">
                       <div className="flex items-center gap-2 text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span className="font-medium text-foreground">{settings?.companyName || 'Not set'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span className="font-medium text-foreground">{timezoneLabel || 'UTC'}</span>
                       </div>
                    </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground mt-4 group-hover:text-primary">
                    Manage settings
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
           </Card>
        </Link>
    );
};

  const WeeklyClientsChart = () => (
    <Card className="col-span-1 lg:col-span-2">
       <CardHeader>
         <CardTitle className="text-xl">Weekly Client Signups</CardTitle>
         <CardDescription>New clients added in the last 6 weeks.</CardDescription>
       </CardHeader>
       <CardContent>
        {isLoading ? (
          <div className="w-full h-[120px] flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-[120px]">
            <RechartsBarChart accessibilityLayer data={weeklyClientsData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="clients" fill="var(--color-clients)" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        )}
       </CardContent>
    </Card>
  );


  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto md:auto-rows-[minmax(200px,auto)]">
        <WeeklyClientsChart />
        <TotalClientsCard />
        <CalendarCard />
        <SettingsCard />
      </div>
    </div>
  );
}
