
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, Globe, Hourglass, Star, Send } from 'lucide-react';
import { getUserSettings, saveUserSettings } from '@/lib/user-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { timezones } from '@/lib/timezones';
import { getCountryFlag, cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { submitFeedback } from '@/ai/flows/send-feedback-flow';

const settingsSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }).optional().or(z.literal('')),
  timezone: z.string().min(1, { message: 'Please select a timezone.' }),
  notificationHours: z.coerce.number().min(0, { message: "Hours can't be negative."}).optional(),
});

const feedbackSchema = z.object({
    rating: z.number().min(1, { message: 'Please select a rating.' }),
    comment: z.string().optional(),
});

function FeedbackForm() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof feedbackSchema>>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: { rating: 0, comment: '' },
    });
    const [hoveredRating, setHoveredRating] = useState(0);

    async function onFeedbackSubmit(values: z.infer<typeof feedbackSchema>) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await submitFeedback({
                rating: values.rating,
                comment: values.comment || '',
                userEmail: user.email || 'Anonymous',
            });
            toast({ title: 'Success!', description: 'Thank you for your feedback!' });
            form.reset({ rating: 0, comment: '' });
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit feedback. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
         <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onFeedbackSubmit)}>
                    <CardHeader>
                        <CardTitle>Submit Feedback</CardTitle>
                        <CardDescription>
                            Have an opinion? We&apos;d love to hear it. Rate your experience with the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Rating</FormLabel>
                                    <FormControl>
                                        <div 
                                            className="flex gap-1"
                                            onMouseLeave={() => setHoveredRating(0)}
                                        >
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        'h-8 w-8 cursor-pointer transition-colors',
                                                        (hoveredRating >= star || field.value >= star)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-muted-foreground'
                                                    )}
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    onClick={() => field.onChange(star)}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us what you think..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Feedback
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}


export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: '',
      timezone: 'UTC',
      notificationHours: 24,
    },
  });

  const selectedTimezoneValue = form.watch('timezone');

  const selectedTimezoneLabel = useMemo(() => {
    const tz = timezones.find(t => t.value === selectedTimezoneValue);
    if (!tz) return 'Select your timezone';
    return `${getCountryFlag(tz.countryCode)} ${tz.label}`;
  }, [selectedTimezoneValue]);


  useEffect(() => {
    async function fetchSettings() {
      if (!user) {
        setIsFetching(false);
        return;
      }
      try {
        const userSettings = await getUserSettings(user.uid);
        if (userSettings) {
          form.reset({ 
            companyName: userSettings.companyName || '',
            timezone: userSettings.timezone || 'UTC',
            notificationHours: userSettings.notificationHours ?? 24,
          });
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Could not fetch your settings.',
        });
      } finally {
        setIsFetching(false);
      }
    }
    fetchSettings();
  }, [user, toast, form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage settings.',
      });
      return;
    }
    setIsLoading(true);

    try {
      await saveUserSettings(user.uid, {
        userId: user.uid,
        companyName: values.companyName,
        timezone: values.timezone,
        notificationHours: values.notificationHours,
      });
      toast({
        title: 'Success!',
        description: 'Your settings have been saved.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not save your settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-2xl">Settings</CardTitle>
              <CardDescription>
                Manage your account and company settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isFetching ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Your Company, Inc." {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="pl-10">
                                  <SelectValue asChild>
                                    <span>{selectedTimezoneLabel}</span>
                                  </SelectValue>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {timezones.map(tz => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {getCountryFlag(tz.countryCode)} {tz.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <FormDescription>
                            All dates and times will be displayed in this timezone.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notificationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Notification</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hourglass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" placeholder="24" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                         <FormDescription>
                            Set how many hours in advance you want to be notified about an upcoming appointment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isLoading || isFetching}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <FeedbackForm />

    </div>
  );
}
