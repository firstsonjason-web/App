"use client";

import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-background pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Terms of Service — LumoLife</h1>
        <div className="text-text-secondary mb-12">
          <p><strong>Last Updated:</strong> June 29, 2026</p>
          <p><strong>Effective Date:</strong> June 29, 2026</p>
        </div>

        <div className="prose prose-lg text-text-secondary max-w-none space-y-8">
          <section className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-8">
            <p className="text-teal-900 font-medium">
              By downloading, installing, or using LumoLife (&quot;the App&quot;), you agree to these Terms. If you do not agree, do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. The Service</h2>
            <p>
              LumoLife helps you build healthier digital habits through goals, focus sessions, progression with the Lumo companion, and optional community features. The current App Store release includes Pro features for all signed-in users at no charge; in-app purchases are not offered in this version.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. User-Generated Content</h2>
            <p>LumoLife allows posts and comments in community features. You agree not to post content that is illegal, harassing, hateful, sexually explicit, spam, or impersonation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Zero Tolerance</h2>
            <p>LumoLife has a <strong>zero tolerance</strong> policy for objectionable content, harassment, hate speech, threats, and scams. Violations may result in immediate account suspension or termination.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Reporting & Blocking</h2>
            <p>Use in-app Report and Block tools or email <a href="mailto:support@stayhealthiness.com" className="text-accent hover:underline">support@stayhealthiness.com</a>. See also our <a href="/community-guidelines" className="text-accent hover:underline">Community Guidelines</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Screen Time</h2>
            <p>Features that use Apple Screen Time require your explicit permission. You can revoke permission in iOS Settings at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Privacy</h2>
            <p>See our <a href="/privacy-policy" className="text-accent hover:underline">Privacy Policy</a> for how we handle personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Disclaimer</h2>
            <p>The App is provided &quot;as is.&quot; LumoLife is a wellness tool, not medical advice. We are not responsible for user-generated content posted by other users.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Contact</h2>
            <p>
              <strong>Email:</strong> <a href="mailto:support@stayhealthiness.com" className="text-accent hover:underline">support@stayhealthiness.com</a><br />
              <strong>Website:</strong> <a href="/support" className="text-accent hover:underline">stayhealthiness.com/support</a>
            </p>
          </section>

          <section className="border-t border-gray-100 pt-8 mt-12">
            <p className="text-sm text-gray-500 italic text-center">
              © 2026 Stay Healthiness. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
