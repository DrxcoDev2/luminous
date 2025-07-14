
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>
            This is your dashboard. You can add your main content here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              The sidebar is collapsible and responsive. Try resizing your browser window to see it in action.
            </p>
            <Button asChild>
              <Link href="/dashboard/clients">
                <Users className="mr-2" />
                View All Clients
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
