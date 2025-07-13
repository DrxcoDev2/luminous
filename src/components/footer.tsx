import { Logo } from './logo';
import { Twitter, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <Logo />
          </div>
          <div className="text-center text-sm text-muted-foreground flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/policy" className="hover:text-foreground">
              Terms & Conditions
            </Link>
             <Link href="/policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
          <div className="flex justify-center md:justify-end gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
         <p className="text-sm text-muted-foreground text-center mt-8">
            &copy; {new Date().getFullYear()} Luminous, Inc. All rights reserved.
          </p>
      </div>
    </footer>
  );
}
