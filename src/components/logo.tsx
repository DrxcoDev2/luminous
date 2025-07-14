import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-90" />
        <span className="text-xl font-bold tracking-tight text-foreground">
          Luminous
        </span>
    </Link>
  );
}
