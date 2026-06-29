import LegalLayout from "@/components/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy for LumoLife"
      updated="June 29, 2026"
      effective="June 29, 2026"
    >
      <section>
        <h2>Introduction</h2>
        <p>
          LumoLife (formerly marketed as Pabo Focus) is a digital wellness app for iPhone. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the &quot;Service&quot;).
        </p>
        <p>
          By using LumoLife, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Service.
        </p>
      </section>

      <section>
        <h2>1. Information We Collect</h2>
        <h3>1.1 Personal Information You Provide</h3>
        <ul>
          <li><strong>Create an Account</strong>: Email address, password (encrypted via Firebase Authentication), display name</li>
          <li><strong>Complete Your Profile</strong>: Profile photo, bio, wellness goals</li>
          <li><strong>Use the Service</strong>: Goals, activities, community posts, and comments</li>
        </ul>

        <h3>1.2 Information Automatically Collected</h3>
        <ul>
          <li><strong>Screen Time data</strong>: Aggregated usage statistics via Apple&apos;s Screen Time APIs and our DeviceActivity extension (only after you grant Family Controls permission)</li>
          <li><strong>App activity</strong>: Goals completed, focus sessions, points, streaks, and feature usage</li>
          <li><strong>Diagnostics</strong>: Crash logs and performance data through Firebase</li>
        </ul>

        <h3>1.3 Third-Party Processors</h3>
        <ul>
          <li><strong>Google Firebase</strong>: authentication, database, storage, and cloud functions</li>
          <li><strong>RevenueCat</strong>: subscription infrastructure (not active in the current App Store release; no in-app purchases are offered)</li>
          <li><strong>Apple</strong>: Sign in with Apple and App Store distribution</li>
        </ul>
        <p>
          We do <strong>not</strong> sell personal information. We do <strong>not</strong> use Stripe in LumoLife.
        </p>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide core features (goals, focus sessions, Lumo progression, community)</li>
          <li>Secure accounts and prevent abuse</li>
          <li>Improve reliability and fix bugs</li>
          <li>Send optional reminders you control in settings</li>
          <li>Comply with law and enforce our Terms</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Share Your Information</h2>
        <p>
          Other users may see information you choose to make public according to your privacy settings. We share data with service providers only as needed to operate LumoLife.
        </p>
      </section>

      <section>
        <h2>4. Data Retention and Deletion</h2>
        <p>
          We retain account data while your account is active. You may delete your account in the app; this removes your profile, goals, posts, usage records, and Firebase Authentication user.
        </p>
      </section>

      <section>
        <h2>5. Your Privacy Rights</h2>
        <p>
          Depending on where you live, you may request access, correction, export, or deletion by using in-app settings or emailing{" "}
          <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>.
        </p>
      </section>

      <section>
        <h2>6. Children&apos;s Privacy</h2>
        <p>
          LumoLife is not intended for children under 13 (or 16 in the EEA). We do not knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>7. Contact Us</h2>
        <p>
          <strong>Email</strong>: <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>
          <br />
          <strong>Website</strong>: https://www.stayhealthiness.com/privacy-policy
        </p>
      </section>
    </LegalLayout>
  );
}
