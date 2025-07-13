'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './logo';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#testimonials', label: 'Testimonials' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 max-w-screen-2xl items-center">
        <div className="mr-12 hidden md:flex">
          <Logo />
        </div>
        
        <div className="flex flex-1 items-center justify-between">
          <div className="md:hidden">
            <Logo />
          </div>
          <nav className="hidden items-center gap-12 text-sm md:flex pl-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-foreground/60 transition-colors hover:text-foreground/80"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
               <Button asChild>
                 <Link href="/register">Sign Up</Link>
               </Button>
             </div>
             <Sheet open={isOpen} onOpenChange={setIsOpen}>
               <SheetTrigger asChild className="md:hidden">
                 <Button variant="outline" size="icon">
                   <Menu className="h-4 w-4" />
                   <span className="sr-only">Open menu</span>
                 </Button>
               </SheetTrigger>
               <SheetContent side="left">
                 <div className="flex flex-col gap-6 p-6">
                   <div className="mb-4">
                    <Logo />
                   </div>
                   <nav className="grid gap-4">
                     {navLinks.map((link) => (
                       <Link
                         key={link.href}
                         href={link.href}
                         onClick={() => setIsOpen(false)}
                         className="py-2 font-medium text-foreground/80 transition-colors hover:text-foreground"
                       >
                         {link.label}
                       </Link>
                     ))}
                   </nav>
                   <div className="flex flex-col gap-2">
                    <Button onClick={() => setIsOpen(false)} asChild className="w-full">
                        <Link href="/register">Sign Up</Link>
                    </Button>
                    <Button onClick={() => setIsOpen(false)} variant="outline" asChild className="w-full">
                        <Link href="/login">Login</Link>
                    </Button>
                   </div>
                 </div>
               </SheetContent>
             </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
