
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
import { Loader2, Building, Globe } from 'lucide-react';
import { getUserSettings, saveUserSettings } from '@/lib/user-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { timezones } from '@/lib/timezones';
import { getCountryFlag } from '@/lib/utils';

const settingsSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }).optional().or(z.literal('')),
  timezone: z.string().min(1, { message: 'Please select a timezone.' }),
});

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
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-2xl mx-auto">
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
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}
