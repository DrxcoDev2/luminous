
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <div className="p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Calendar</CardTitle>
          <CardDescription>
            View and manage your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is where your calendar will be displayed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
