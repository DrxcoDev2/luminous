
'use client';
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUp, signInWithGoogle, signInWithGitHub } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Github, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/contexts/auth-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveUserSettings, ensureUserSettings } from '@/lib/user-settings';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  accountType: z.enum(['individual', 'business'], {
    required_error: 'You need to select an account type.',
  }),
});

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await signUp(values.email, values.password);
      const newUser = userCredential.user;
      if(newUser) {
        await saveUserSettings(newUser.uid, {
            userId: newUser.uid,
            accountType: values.accountType,
            name: values.name,
            email: values.email,
        })
      }
      // The redirection is now handled by the AuthProvider
    } catch (error: unknown) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'This email address is already in use by another account.';
            break;
          case 'auth/weak-password':
            description = 'The password is too weak. Please choose a stronger password.';
            break;
          case 'auth/invalid-email':
            description = 'The email address is not valid. Please check and try again.';
            break;
          case 'auth/operation-not-allowed':
            description = 'Email/password sign up is not enabled. Please contact support.';
            break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialLogin(provider: 'google' | 'github') {
    setIsSocialLoading(provider);
    try {
        const userCredential =
      provider === 'google'
        ? await signInWithGoogle()
        : await signInWithGitHub();

      const newUser = userCredential.user;
      if (newUser) {
         await ensureUserSettings(newUser);
      }
      // The redirection is now handled by the AuthProvider
    } catch (error: unknown) {
      let message = 'An unknown error occurred.';
      if (error instanceof FirebaseError) {
         if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            // User closed the popup, so we don't need to show an error.
            setIsSocialLoading(null);
            return;
         }
        message = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: message,
      });
    } finally {
      setIsSocialLoading(null);
    }
  }

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Are you an individual or a business?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="individual" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Individual
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="business" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Business
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{' '}
                <Link href="/policy" className="underline hover:text-primary">
                  Terms &amp; Conditions
                </Link>
                .
              </p>
              <Button type="submit" className="w-full" disabled={isLoading || !!isSocialLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'github' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Github
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.612-3.311-11.284-7.914l-6.57 4.818C9.656 40.063 16.318 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.609 37.021 44 31.018 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
              )}
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="text-sm text-muted-foreground w-full text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
