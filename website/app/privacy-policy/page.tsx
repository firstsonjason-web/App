import LegalLayout from "@/components/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 29, 2026" effective="June 29, 2026">
      <section>
        <h2>Introduction</h2>
        <p>
          LumoLife (formerly marketed as Pabo Focus) is a digital wellness app for iPhone. This policy explains what we collect, why, and the choices you have.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <p><strong>You provide:</strong> email, profile details, goals, and community posts.</p>
        <p><strong>Automatic:</strong> Screen Time statistics (with permission), app usage, diagnostics.</p>
        <p><strong>Processors:</strong> Firebase, RevenueCat (inactive in current release), Apple Sign in.</p>
        <p>We do not sell personal information. We do not use Stripe.</p>
      </section>

      <section>
        <h2>How we use data</h2>
        <p>To run the app, secure accounts, improve reliability, send optional reminders, and comply with law.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Request access, correction, or deletion via in-app settings or{" "}
          <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>LumoLife is not directed to children under 13 (or 16 in the EEA).</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email: <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
