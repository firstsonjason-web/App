"use client";

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Privacy Policy for Pabo Focus</h1>
        <div className="text-text-secondary mb-12">
          <p><strong>Last Updated:</strong> December 26, 2025</p>
          <p><strong>Effective Date:</strong> December 26, 2025</p>
        </div>

        <div className="prose prose-lg text-text-secondary max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Introduction</h2>
            <p>
              Welcome to Pabo Focus. We are committed to protecting your privacy and ensuring you have a positive experience when using our digital wellness application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the "Service").
            </p>
            <p>
              Please read this Privacy Policy carefully. By using Pabo Focus, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">1.1 Personal Information You Provide</h3>
            <p>We collect information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Create an Account</strong>: Email address, password (encrypted), display name</li>
              <li><strong>Complete Your Profile</strong>: Profile photo, bio/introduction, personal wellness goals</li>
              <li><strong>Use the Service</strong>: Goals you set, activities you complete, posts you create, comments you make</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">1.2 Information Automatically Collected</h3>
            <p>When you use Pabo Focus, we automatically collect certain information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Device Usage Data</strong>: Screen time statistics, app usage patterns, device activity data (collected via iOS ScreenTime API and Android UsageStats API)</li>
              <li><strong>App Usage Information</strong>: Features used, frequency of use, session duration, goal completion rates</li>
              <li><strong>Device Information</strong>: Device type, operating system version, unique device identifiers, mobile network information</li>
              <li><strong>Performance Data</strong>: Crash reports, diagnostic information, app performance metrics</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">1.3 Information from Third-Party Services</h3>
            <p>We use the following third-party services that may collect information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Firebase Authentication</strong>: For secure user authentication</li>
              <li><strong>Firebase Firestore</strong>: For data storage and synchronization</li>
              <li><strong>Firebase Storage</strong>: For storing profile images and user content</li>
              <li><strong>Stripe</strong>: For payment processing (Pro and ProMax subscriptions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Core App Functionality</strong>: Create and manage your account, provide personalized recommendations, track progress, calculate points/streaks, enable social features, and display statistics.</li>
              <li><strong>Service Improvement</strong>: Analyze app usage, fix technical issues, and develop new features.</li>
              <li><strong>Communication</strong>: Send goal reminders, daily summaries, and respond to support requests.</li>
              <li><strong>Security and Compliance</strong>: Protect against fraud, enforce Terms of Service, and comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. How We Share Your Information</h2>
            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">3.1 With Other Users (Based on Your Settings)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Public Profiles</strong>: Visible display name, photo, bio, points, and streak.</li>
              <li><strong>Private Profiles</strong>: Only approved friends can see your information.</li>
              <li><strong>Community Posts</strong>: Visible to all users unless deleted.</li>
            </ul>
            <h3 className="text-xl font-semibold text-text-primary mt-6 mb-2">3.2 With Service Providers</h3>
            <p>We share information with trusted providers like Firebase (Google) and Stripe for operations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Data Retention</h2>
            <p>We retain your information for as long as necessary to provide the Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information</strong>: Retained until account deletion.</li>
              <li><strong>Usage Data</strong>: Retained for up to 2 years for analytics.</li>
              <li><strong>Screen Time Data</strong>: Stored locally and in our database for historical tracking.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Your Privacy Rights</h2>
            <p>You have the right to access, export, correct, or delete your personal data. To exercise these rights, use the in-app settings or email us at <strong>support@stayhealthiness.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Data Security</h2>
            <p>We implement industry-standard security measures including TLS/SSL encryption, bcrypt hashing, and Firebase Security Rules to protect your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Children's Privacy</h2>
            <p>Pabo Focus is not intended for children under 13 (or 16 in the EEA). We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">8. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your country of residence, with adequate protections in place.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">9. California Privacy Rights (CCPA)</h2>
            <p>California residents have the right to know, delete, and opt-out of the sale of their personal information. We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">10. European Privacy Rights (GDPR)</h2>
            <p>EEA users have rights to access, rectification, erasure, and more under GDPR. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">11. Cookies and Tracking</h2>
            <p>We use essential cookies for functionality and Firebase Analytics for anonymized usage tracking.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">15. Contact Us</h2>
            <p>
              <strong>Email</strong>: support@stayhealthiness.com<br />
              <strong>Website</strong>: https://stayhealthiness.com/privacy-policy
            </p>
          </section>

          <section className="border-t border-gray-100 pt-8 mt-12">
            <p className="text-sm text-gray-500 italic text-center">
              Pabo Focus - Stay Healthy, Be Happy
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
