
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getFeedback } from '@/lib/firestore';
import type { Feedback } from '@/types/feedback';
import { format } from 'date-fns';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ADMIN_EMAIL = 'cristianmupe2021@gmail.com';

const RatingDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
            <Star
                key={star}
                className={cn(
                    'h-5 w-5',
                    rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                )}
            />
        ))}
    </div>
);


export default function FeedbackPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!loading && user?.email !== ADMIN_EMAIL) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchFeedback() {
            if (user?.email !== ADMIN_EMAIL) {
                setIsFetching(false);
                return;
            }

            try {
                const feedback = await getFeedback();
                setFeedbackList(feedback);
            } catch {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch feedback submissions.',
                });
            } finally {
                setIsFetching(false);
            }
        }
        
        fetchFeedback();
    }, [user, toast]);

    if (loading || user?.email !== ADMIN_EMAIL) {
        return (
            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">User Feedback</CardTitle>
                    <CardDescription>
                        All feedback submissions from application users are listed here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {isFetching ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                        ) : feedbackList.length > 0 ? (
                            feedbackList.map(feedback => (
                                <Card key={feedback.id} className="bg-muted/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{feedback.userEmail}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(feedback.createdAt.seconds * 1000), 'PPP p')}
                                                </p>
                                            </div>
                                        </div>
                                         <RatingDisplay rating={feedback.rating} />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-foreground italic">
                                            &quot;{feedback.comment || 'No comment provided.'}&quot;
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No feedback submissions yet.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
