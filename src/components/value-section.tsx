import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CalendarCheck, BellRing } from 'lucide-react';

const features = [
  {
    icon: <CalendarCheck className="h-10 w-10 text-primary" />,
    title: 'Easy Scheduling',
    description: 'Our intuitive calendar allows you to book and view appointments with ease, avoiding any scheduling conflicts.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Client Management',
    description: 'Keep all your client information organized in one place, from contact details to their complete appointment history.',
  },
  {
    icon: <BellRing className="h-10 w-10 text-primary" />,
    title: 'Automated Reminders',
    description: 'Reduce no-shows with automated email reminders sent to your clients before their scheduled appointments.',
  },
];

export default function ValueSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Everything You Need to Streamline Your Business</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Luminous is packed with features designed to help you manage your appointments and clients efficiently.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="pt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
