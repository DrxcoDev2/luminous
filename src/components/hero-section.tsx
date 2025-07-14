import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none">
                Effortlessly Manage Your Client Appointments
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                Luminous provides the tools you need to schedule appointments, manage clients, and grow your service-based business.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link href="/register">
                  Get Started Free
                  <MoveRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
          <Image
            alt="Hero"
            className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full"
            height="550"
            src="https://placehold.co/550x550.png"
            width="550"
            data-ai-hint="internet illustration"
          />
        </div>
      </div>
    </section>
  );
}
