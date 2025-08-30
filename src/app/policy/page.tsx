
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
        <Card className="max-w-4xl mx-auto my-8">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground prose prose-gray dark:prose-invert">
            <p>Last updated: {currentDate}</p>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">GNU GENERAL PUBLIC LICENSE</h3>
              <p>
                
                Version 3, 29 June 2007

                Copyright (C) 2007 Free Software Foundation, Inc. https://fsf.org/
                  Everyone is permitted to copy and distribute verbatim copies
                  of this license document, but changing it is not allowed.

                Preamble

                The GNU General Public License is a free, copyleft license for
                software and other kinds of works.

                The licenses for most software and other practical works are designed
                to take away your freedom to share and change the works. By contrast,
                the GNU General Public License is intended to guarantee your freedom to
                share and change all versions of a program--to make sure it remains free
                software for all its users. We, the Free Software Foundation, use the
                GNU General Public License for most of our software; it applies also to
                any other work released this way by its authors. You can apply it to
                your programs, too.

                When we speak of free software, we are referring to freedom, not
                price. Our General Public Licenses are designed to make sure that you
                have the freedom to distribute copies of free software (and charge for
                them if you wish), that you receive source code or can get it if you
                want it, that you can change the software or use pieces of it in new
                free programs, and that you know you can do these things.

                To protect your rights, we need to prevent others from denying you
                these rights or asking you to surrender the rights. Therefore, you have
                certain responsibilities if you distribute copies of the software, or if
                you modify it: responsibilities to respect the freedom of others.

                For example, if you distribute copies of such a program, whether
                gratis or for a fee, you must pass on to the recipients the same
                freedoms that you received. You must make sure that they, too, receive
                or can get the source code. And you must show them these terms so they
                know their rights.

                Developers that use the GNU GPL protect your rights with two steps:
                (1) assert copyright on the software, and (2) offer you this License
                giving you legal permission to copy, distribute and/or modify it.

                For the developers and authors protection, the GPL clearly explains
                that there is no warranty for this free software. For both users and
                authors sake, the GPL requires that modified versions be marked as
                changed, so that their problems will not be attributed erroneously to
                authors of previous versions.

                Some devices are designed to deny users access to install or run
                modified versions of the software inside them, although the manufacturer
                can do so. This is fundamentally incompatible with the aim of
                protecting users freedom to change the software. The systematic
                pattern of such abuse occurs in the area of products for individuals to
                use, which is precisely where it is most unacceptable. Therefore, we
                have designed this version of the GPL to prohibit the practice for those
                products. If such problems arise substantially in other domains, we
                stand ready to extend this provision to those domains in future versions
                of the GPL, as needed to protect the freedom of users.

                Finally, every program is threatened constantly by software patents.
                States should not allow patents to restrict development and use of
                software on general-purpose computers, but in those that do, we wish to
                avoid the special danger that patents applied to a free program could
                make it effectively proprietary. To prevent this, the GPL assures that
                patents cannot be used to render the program non-free.

                The precise terms and conditions for copying, distribution and
                modification follow.
              </p>
            </div>

          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
