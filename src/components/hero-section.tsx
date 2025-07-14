import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 lg:px-20">
      <div className="container px-4 grid items-center justify-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col items-start space-y-4 text-center md:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none">
              Effortlessly Manage Your Client Appointments
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Luminous provides the tools you need to schedule appointments, manage clients, and grow your service-based business.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
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
         <div className="flex justify-center">
          <div className="w-full max-w-md p-8 bg-accent rounded-xl shadow-lg flex items-center justify-center">
             <div className="text-center text-muted-foreground">
                <svg
                  className="w-24 h-24 mx-auto text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-4">Scheduling, simplified.</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
