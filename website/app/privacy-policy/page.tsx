"use client";

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Privacy Policy for LumoLife</h1>
        <div className="text-text-secondary mb-12">
          <p><strong>Last Updated:</strong> June 29, 2026</p>
          <p><strong>Effective Date:</strong> June 29, 2026</p>
        </div>

        <div className="prose prose-lg text-text-secondary max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Introduction</h2>
            <p>
              LumoLife (formerly marketed as Pabo Focus) is a digital wellness app for iPhone. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the &quot;Service&quot;).
            </p>
            <p>
              By using LumoLife, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">1.1 Personal Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Create an Account</strong>: Email address, password (encrypted via Firebase Authentication), display name</li>
              <li><strong>Complete Your Profile</strong>: Profile photo, bio, wellness goals</li>
              <li><strong>Use the Service</strong>: Goals, activities, community posts, and comments</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">1.2 Information Automatically Collected</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Screen Time data</strong>: Aggregated usage statistics via Apple&apos;s Screen Time APIs and our DeviceActivity extension (only after you grant Family Controls permission)</li>
              <li><strong>App activity</strong>: Goals completed, focus sessions, points, streaks, and feature usage</li>
              <li><strong>Diagnostics</strong>: Crash logs and performance data through Firebase</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">1.3 Third-Party Processors</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Firebase</strong> — authentication, database, storage, and cloud functions</li>
              <li><strong>RevenueCat</strong> — subscription infrastructure (not active in the current App Store release; no in-app purchases are offered)</li>
              <li><strong>Apple</strong> — Sign in with Apple and App Store distribution</li>
            </ul>
            <p>We do <strong>not</strong> sell personal information. We do <strong>not</strong> use Stripe in LumoLife.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide core features (goals, focus sessions, Lumo progression, community)</li>
              <li>Secure accounts and prevent abuse</li>
              <li>Improve reliability and fix bugs</li>
              <li>Send optional reminders you control in settings</li>
              <li>Comply with law and enforce our Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. How We Share Your Information</h2>
            <p>Other users may see information you choose to make public according to your privacy settings. We share data with service providers only as needed to operate LumoLife.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Data Retention & Deletion</h2>
            <p>We retain account data while your account is active. You may delete your account in the app; this removes your profile, goals, posts, usage records, and Firebase Authentication user.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Your Privacy Rights</h2>
            <p>Depending on where you live, you may request access, correction, export, or deletion by using in-app settings or emailing <strong>support@stayhealthiness.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Children&apos;s Privacy</h2>
            <p>LumoLife is not intended for children under 13 (or 16 in the EEA). We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Contact Us</h2>
            <p>
              <strong>Email</strong>: support@stayhealthiness.com<br />
              <strong>Website</strong>: https://www.stayhealthiness.com/privacy-policy
            </p>
          </section>

          <section className="border-t border-gray-100 pt-8 mt-12">
            <p className="text-sm text-gray-500 italic text-center">
              LumoLife — Stay Healthy, Be Happy
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
