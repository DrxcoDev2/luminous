import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    title: 'Founder, TechNova',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'woman portrait',
    quote: 'Luminous has been a game-changer for our marketing efforts. We launched our new landing page in a day and saw a 30% increase in conversions.',
  },
  {
    name: 'Michael Chen',
    title: 'Marketing Director, Creative Solutions',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'man portrait',
    quote: 'The design templates are absolutely beautiful and so easy to customize. Our brand has never looked better. Highly recommended!',
  },
  {
    name: 'Emily Rodriguez',
    title: 'CEO, BrightFuture Co.',
    image: 'https://placehold.co/100x100.png',
    dataHint: 'person portrait',
    quote: 'As a non-technical founder, I was looking for a simple yet powerful tool. Luminous delivered on all fronts. The support team is also fantastic.',
  },
];

function Rating({ count = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}


export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Loved by Teams Worldwide</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our happy customers have to say about Luminous.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="flex flex-col justify-between">
              <CardContent className="p-6">
                <Rating />
                <p className="mt-4 text-muted-foreground">"{testimonial.quote}"</p>
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
          ))}
        </div>
      </div>
    </section>
  );
}
