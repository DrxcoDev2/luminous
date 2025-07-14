
'use client';
export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, LayoutDashboard, Loader2, LogOut, Settings, UserCircle, Users, BarChartHorizontal, MessageSquare } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FirebaseError } from 'firebase/app';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error: unknown) {
      let message = 'An unknown error occurred.';
      if (error instanceof FirebaseError) {
        message = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: message,
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/clients', icon: Users, label: 'Clients' },
    { href: '/dashboard/team', icon: Users, label: 'Team' },
    { href: '/dashboard/analytics', icon: BarChartHorizontal, label: 'Analytics' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const adminNavItems = [
    { href: '/dashboard/feedback', icon: MessageSquare, label: 'Feedback' },
  ]

  const isAdmin = user.email === 'cristianmupe2021@gmail.com';


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {navItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                <SidebarMenuButton href={item.href} isActive={pathname === item.href}>
                  <item.icon className="transition-transform duration-300 group-hover/menu-item:rotate-12" />
                  {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {isAdmin && adminNavItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                <SidebarMenuButton href={item.href} isActive={pathname === item.href}>
                  <item.icon className="transition-transform duration-300 group-hover/menu-item:rotate-12" />
                  {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 flex-row justify-between items-center">
           <div className="flex items-center gap-2 overflow-hidden">
             <Avatar className="h-8 w-8">
               <AvatarImage src={user.photoURL ?? ''} />
                <AvatarFallback>
                  <UserCircle />
                </AvatarFallback>
             </Avatar>
             <span className="text-sm text-muted-foreground truncate">{user.email}</span>
           </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
            <LogOut />
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="sticky top-0 z-10 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-center text-sm p-2 font-medium">
            This is not the official version, it was created for feedback only.
        </div>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-xl md:text-2xl font-semibold capitalize flex-1 text-center md:text-left">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
          <div className="w-8"></div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
