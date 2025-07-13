import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FastForward, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <FastForward className="h-10 w-10 text-primary" />,
    title: 'Build in Minutes',
    description: 'Our intuitive drag-and-drop builder lets you create beautiful pages without writing a single line of code.',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: 'Stunning Designs',
    description: 'Choose from a library of professionally designed templates that are fully customizable to match your brand.',
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-primary" />,
    title: 'High-Converting',
    description: 'Optimize for success with built-in A/B testing, analytics, and integrations with your favorite tools.',
  },
];

export default function ValueSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Everything You Need to Shine</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Luminous is packed with features designed to help you launch and grow your business online.
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
