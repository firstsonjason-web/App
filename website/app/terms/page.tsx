import LegalLayout from "@/components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 29, 2026" effective="June 29, 2026">
      <section>
        <p>
          By using LumoLife you agree to these Terms. Pro features are included for all signed-in users in the current App Store release; in-app purchases are not offered in this version.
        </p>
      </section>

      <section>
        <h2>Community</h2>
        <p>No illegal, harassing, hateful, sexually explicit, or spam content. We may remove content and suspend accounts that violate these Terms.</p>
      </section>

      <section>
        <h2>Reporting</h2>
        <p>
          Use in-app Report and Block tools or email{" "}
          <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>.
          See our <a href="/community-guidelines/">community guidelines</a>.
        </p>
      </section>

      <section>
        <h2>Screen Time</h2>
        <p>Requires your explicit permission. Revoke anytime in iOS Settings.</p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          See our <a href="/privacy-policy/">privacy policy</a>.
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>LumoLife is a wellness tool, not medical advice. The app is provided as is.</p>
      </section>
    </LegalLayout>
  );
}
