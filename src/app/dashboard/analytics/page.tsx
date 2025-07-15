
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CalendarCheck } from 'lucide-react';
import type { Client } from '@/types/client';
import { useAuth } from '@/contexts/auth-context';
import { getClients } from '@/lib/firestore';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const clientChartConfig = {
  clients: {
    label: "New Clients",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const appointmentChartConfig = {
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  upcoming: { label: "Upcoming", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function AnalyticsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const fetchedClients = await getClients(user.uid);
        setClients(fetchedClients);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalyticsData();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcomingAppointments = clients.filter(c => c.appointmentDateTime && parseISO(c.appointmentDateTime) > now).length;
    const completedAppointments = clients.filter(c => c.appointmentDateTime && parseISO(c.appointmentDateTime) <= now).length;
    
    return {
      totalClients: clients.length,
      upcomingAppointments,
      completedAppointments,
    };
  }, [clients]);

  const monthlyClientData = useMemo(() => {
    const monthLabels = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return format(d, 'MMM yyyy');
    }).reverse();

    const data = monthLabels.map(label => ({
      date: label,
      clients: 0,
    }));

    clients.forEach(client => {
      if (client.createdAt) {
        const createdAtDate = client.createdAt.toDate();
        const monthStr = format(createdAtDate, 'MMM yyyy');
        const monthData = data.find(d => d.date === monthStr);
        if (monthData) {
          monthData.clients++;
        }
      }
    });

    return data;
  }, [clients]);

  const appointmentStatusData = useMemo(() => {
    return [
        { name: 'Completed', value: stats.completedAppointments, fill: 'hsl(var(--chart-1))' },
        { name: 'Upcoming', value: stats.upcomingAppointments, fill: 'hsl(var(--chart-2))' },
    ].filter(item => item.value > 0);
  }, [stats.completedAppointments, stats.upcomingAppointments]);


  const StatCard = ({ title, value, icon, isLoading }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-8 w-20" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Clients" value={stats.totalClients} icon={<Users className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Completed Appointments" value={stats.completedAppointments} icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Client Growth</CardTitle>
                <CardDescription>New clients added in the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
             {isLoading ? <Skeleton className="w-full h-[250px]" /> : (
                <ChartContainer config={clientChartConfig} className="w-full h-[250px]">
                    <BarChart accessibilityLayer data={monthlyClientData} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="clients" fill="var(--color-clients)" radius={4} />
                    </BarChart>
                </ChartContainer>
             )}
            </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
                <CardDescription>A breakdown of your appointments.</CardDescription>
            </CardHeader>
             <CardContent>
              {isLoading ? <Skeleton className="w-full h-[250px]" /> : (
                <ChartContainer config={appointmentChartConfig} className="w-full h-[250px]">
                   <PieChart accessibilityLayer>
                      <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                          data={appointmentStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={60}
                          paddingAngle={5}
                          labelLine={false}
                       >
                         {appointmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                   </PieChart>
                </ChartContainer>
              )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
