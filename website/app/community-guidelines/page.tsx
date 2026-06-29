import LegalLayout from "@/components/LegalLayout";
import { CheckCircle2, XCircle, AlertTriangle, Flag } from "lucide-react";

export default function CommunityGuidelinesPage() {
  return (
    <LegalLayout title="Community Guidelines" updated="June 29, 2026" effective="June 29, 2026">
      <section className="rounded-card border border-lumo-teal/20 bg-lumo-teal/5 p-6">
        <p className="text-white/90">
          LumoLife community features exist to support digital wellness. These rules keep the space safe and constructive.
        </p>
      </section>

      <section>
        <h2>Our values</h2>
        <div className="not-prose mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { title: "Respect", desc: "Kindness in posts, comments, and DMs." },
            { title: "Support", desc: "Celebrate progress without shaming slips." },
            { title: "Authenticity", desc: "Share real experiences, not spam." },
            { title: "Privacy", desc: "Do not share others' personal information." },
          ].map((v) => (
            <div key={v.title} className="rounded-card border border-white/10 bg-surface p-4">
              <h3 className="font-semibold text-white">{v.title}</h3>
              <p className="mt-1 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2">
          <CheckCircle2 className="text-lumo-teal" size={22} aria-hidden />
          Encouraged
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Share progress and celebrate milestones</li>
          <li>Offer practical tips that helped you</li>
          <li>Report content that breaks these rules</li>
          <li>Welcome newcomers patiently</li>
        </ul>
      </section>

      <section>
        <h2 className="flex items-center gap-2">
          <XCircle className="text-red-400" size={22} aria-hidden />
          Prohibited
        </h2>
        <p>Harassment, hate speech, sexually explicit or violent content, spam, scams, and deliberate misinformation about health or safety.</p>
      </section>

      <section>
        <h2 className="flex items-center gap-2">
          <AlertTriangle className="text-lumo-gold" size={22} aria-hidden />
          Enforcement
        </h2>
        <p>
          First violation: warning and content removal. Repeat violations: temporary suspension. Severe or illegal content: immediate permanent ban.
        </p>
      </section>

      <section>
        <h2 className="flex items-center gap-2">
          <Flag className="text-lumo-teal" size={22} aria-hidden />
          Reporting
        </h2>
        <p>
          Tap the menu on any post or profile, choose Report, and pick a reason. Our team reviews reports promptly. For urgent issues, email{" "}
          <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
