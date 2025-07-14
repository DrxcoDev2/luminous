
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  return (
    <div className="p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Clients</CardTitle>
          <CardDescription>
            Manage your clients here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is where you can add, view, and edit your client information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
