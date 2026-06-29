import LegalLayout from "@/components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 29, 2026" effective="June 29, 2026">
      <section className="rounded-card border border-lumo-teal/20 bg-lumo-teal/5 p-6 not-prose">
        <p className="text-white/90">
          By downloading, installing, or using LumoLife (&quot;the App&quot;), you agree to these Terms. If you do not agree, do not use the App.
        </p>
      </section>

      <section>
        <h2>1. The Service</h2>
        <p>
          LumoLife helps you build healthier digital habits through goals, focus sessions, progression with the Lumo companion, and optional community features. The current App Store release includes Pro features for all signed-in users at no charge; in-app purchases are not offered in this version.
        </p>
      </section>

      <section>
        <h2>2. User-Generated Content</h2>
        <p>
          LumoLife allows posts and comments in community features. You agree not to post content that is illegal, harassing, hateful, sexually explicit, spam, or impersonation.
        </p>
      </section>

      <section>
        <h2>3. Zero Tolerance</h2>
        <p>
          LumoLife has a <strong>zero tolerance</strong> policy for objectionable content, harassment, hate speech, threats, and scams. Violations may result in immediate account suspension or termination.
        </p>
      </section>

      <section>
        <h2>4. Reporting and Blocking</h2>
        <p>
          Use in-app Report and Block tools or email{" "}
          <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>. See also our{" "}
          <a href="/community-guidelines/">Community Guidelines</a>.
        </p>
      </section>

      <section>
        <h2>5. Screen Time</h2>
        <p>
          Features that use Apple Screen Time require your explicit permission. You can revoke permission in iOS Settings at any time.
        </p>
      </section>

      <section>
        <h2>6. Privacy</h2>
        <p>
          See our <a href="/privacy-policy/">Privacy Policy</a> for how we handle personal data.
        </p>
      </section>

      <section>
        <h2>7. Disclaimer</h2>
        <p>
          The App is provided &quot;as is.&quot; LumoLife is a wellness tool, not medical advice. We are not responsible for user-generated content posted by other users.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          <strong>Email:</strong> <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>
          <br />
          <strong>Website:</strong> <a href="/support/">stayhealthiness.com/support</a>
        </p>
      </section>
    </LegalLayout>
  );
}
