import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { UserCircle, LogOut } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"



export default function SlideAI() {
    return (
        <SidebarProvider>
            <Sidebar side="right" className="m-10 mb-10">
                <SidebarHeader className="p-4">
                    <h1>Current Conversations</h1>
                </SidebarHeader>
                <SidebarContent className="p-4">
                    <SidebarMenu>
                        {/*{navItems.map((item) => (
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
                        ))}*/}
                    </SidebarMenu>
                </SidebarContent>
                {/*<SidebarFooter className="p-4 flex-row justify-between items-center">
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
                </SidebarFooter>*/}
            </Sidebar>
            
        </SidebarProvider>
    )
}