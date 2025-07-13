import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';

export default function CtaSection() {
  return (
    <section id="cta" className="bg-accent">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Ready to Illuminate Your Brand?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of creators building their best work with Luminous. Start your free trial today. No credit card required.
          </p>
          <Button size="lg" asChild className="shadow-lg">
            <Link href="/register">
              Start Building for Free
              <MoveRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
