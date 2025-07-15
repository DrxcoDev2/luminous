
'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PolicyPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground prose prose-gray dark:prose-invert">
            <p>Last updated: {currentDate}</p>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">1. Introduction</h3>
              <p>
                Welcome to Luminous! These Terms and Conditions outline the rules and regulations for the use of
                Luminous&apos;s Website, located at luminous.app. By accessing this website we assume you accept
                these terms and conditions. Do not continue to use Luminous if you do not agree to take all of
                the terms and conditions stated on this page.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">2. Intellectual Property Rights</h3>
              <p>
                Other than the content you own, under these Terms, Luminous and/or its licensors own all the
                intellectual property rights and materials contained in this Website. You are granted limited
                license only for purposes of viewing the material contained on this Website.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">3. Restrictions</h3>
              <p>You are specifically restricted from all of the following:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publishing any Website material in any other media.</li>
                <li>Selling, sublicensing and/or otherwise commercializing any Website material.</li>
                <li>Publicly performing and/or showing any Website material.</li>
                <li>Using this Website in any way that is or may be damaging to this Website.</li>
                <li>Using this Website in any way that impacts user access to this Website.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">4. Your Content</h3>
              <p>
                In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text,
                images or other material you choose to display on this Website. By displaying Your Content, you
                grant Luminous a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce,
                adapt, publish, translate and distribute it in any and all media.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">5. No warranties</h3>
              <p>
                This Website is provided “as is,” with all faults, and Luminous express no representations or
                warranties, of any kind related to this Website or the materials contained on this Website. Also,
                nothing contained on this Website shall be interpreted as advising you.
              </p>
            </div>
             <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">6. Limitation of liability</h3>
              <p>
                In no event shall Luminous, nor any of its officers, directors and employees, shall be held liable
                for anything arising out of or in any way connected with your use of this Website whether such
                liability is under contract. Luminous, including its officers, directors and employees shall not be
                held liable for any indirect, consequential or special liability arising out of or in any way related
                to your use of this Website.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
