import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="w-full py-24 px-18 md:py-32 lg:py-40 lg:pl-[200px]">
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
          <div className="w-full p-2 bg-accent rounded-xl shadow-lg flex items-center justify-center">
             <div className="text-center text-muted-foreground">
                <Image
                src="/beb.png"
                alt='Hero'
                width={1000}
                height={900} />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
