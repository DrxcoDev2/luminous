
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import React from 'react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    title: 'Founder, TechNova',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'woman portrait',
    quote:
      'Luminous has been a game-changer for my consultancy. I can now manage all my client appointments in one place, and the automated reminders are a lifesaver!',
  },
  {
    name: 'Michael Chen',
    title: 'Marketing Director, Creative Solutions',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'man portrait',
    quote:
      'The calendar view is fantastic and so easy to use. Our team coordination has improved dramatically since we started using Luminous for scheduling.',
  },
  {
    name: 'Emily Rodriguez',
    title: 'CEO, BrightFuture Co.',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'person portrait',
    quote:
      'As a non-technical founder, I needed a simple tool to manage bookings. Luminous delivered perfectly. The support team is also fantastic.',
  },
  {
    name: 'David Lee',
    title: 'Freelance Designer',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'man portrait glasses',
    quote: 'The client management features are surprisingly powerful. It saved me from buying a separate CRM tool. A must-have for any freelancer.',
  },
  {
    name: 'Jessica Williams',
    title: 'E-commerce Specialist',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'woman smiling',
    quote: 'Our client consultations are now seamlessly organized with Luminous. It\'s fast, responsive, and looks amazing on all devices.',
  },
    {
    name: 'Alex Thompson',
    title: 'Indie Developer',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'developer coding',
    quote: 'The ability to see my entire week at a glance is a dream. I can integrate my own custom client notes seamlessly.',
  },
  {
    name: 'Olivia Martinez',
    title: 'Product Manager',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'professional woman',
    quote: 'Luminous helped us organize our user testing sessions faster than ever. The ability to quickly schedule and track participants is invaluable.',
  },
];

function Rating({ count = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

const TestimonialCard = ({ testimonial }: { testimonial: (typeof testimonials)[0] }) => (
    <Card className="flex flex-col justify-between h-full min-w-[350px] max-w-[350px] shadow-lg">
      <CardContent className="p-6">
        <Rating />
        <p className="mt-4 text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
      </CardContent>
      <div className="bg-muted p-6 flex items-center gap-4">
        <Avatar>
          <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.dataHint} />
          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
        </div>
      </div>
    </Card>
);

export default function TestimonialsSection() {
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Loved by Teams Worldwide</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our happy customers have to say about Luminous.
          </p>
        </div>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
            <div className="flex w-max space-x-4 testimonial-scroller hover:[animation-play-state:paused]">
              {duplicatedTestimonials.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
