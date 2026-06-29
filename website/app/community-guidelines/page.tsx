import LegalLayout from "@/components/LegalLayout";

const prohibited = [
  {
    title: "1. Harassment and Bullying",
    items: [
      "Personal attacks or insults",
      "Intimidation or threats",
      "Stalking or unwanted contact",
      "Doxxing or sharing private information",
    ],
  },
  {
    title: "2. Hate Speech",
    items: [
      "Content promoting hatred based on race, ethnicity, religion, gender, sexual orientation, disability, or any other characteristic",
      "Slurs or derogatory language",
      "Symbols or imagery associated with hate groups",
    ],
  },
  {
    title: "3. Inappropriate Content",
    items: [
      "Sexually explicit material",
      "Graphic violence",
      "Content depicting self-harm",
      "Drug or substance abuse promotion",
    ],
  },
  {
    title: "4. Spam and Scams",
    items: [
      "Unsolicited advertisements",
      "Pyramid schemes or MLM promotions",
      "Phishing attempts",
      "Repetitive or meaningless posts",
    ],
  },
  {
    title: "5. Misinformation",
    items: ["False health claims", "Dangerous advice", "Deliberately misleading content"],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <LegalLayout title="Community Guidelines" updated="June 29, 2026" effective="June 29, 2026">
      <section className="rounded-card border border-lumo-teal/20 bg-lumo-teal/5 p-6 not-prose">
        <p className="text-white/90">
          Welcome to the LumoLife community. These guidelines help us maintain a positive, supportive environment for everyone focused on digital wellness.
        </p>
      </section>

      <section>
        <h2>Our values</h2>
        <div className="not-prose mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { title: "Respect", desc: "Treat all community members with kindness and respect." },
            { title: "Support", desc: "Encourage others on their digital wellness journey." },
            { title: "Authenticity", desc: "Be genuine and honest in your interactions." },
            { title: "Privacy", desc: "Respect others' privacy and personal boundaries." },
          ].map((value) => (
            <div key={value.title} className="rounded-card border border-white/10 bg-surface p-4">
              <h3 className="font-semibold text-white">{value.title}</h3>
              <p className="mt-1 text-sm">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Encouraged behavior</h2>
        <ul>
          <li>Share your progress and celebrate achievements</li>
          <li>Offer encouragement and support to fellow users</li>
          <li>Provide helpful tips and advice</li>
          <li>Report content that violates these guidelines</li>
          <li>Be patient and understanding with newcomers</li>
        </ul>
      </section>

      <section>
        <h2>Prohibited content</h2>
        <p>The following content is strictly prohibited:</p>
        <div className="not-prose mt-6 space-y-4">
          {prohibited.map((block) => (
            <div key={block.title} className="rounded-card border border-red-500/20 bg-red-950/20 p-5">
              <h3 className="font-semibold text-red-200">{block.title}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-100/80">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Enforcement</h2>
        <p>Violations of these guidelines will result in:</p>
        <div className="not-prose mt-4 space-y-3">
          {[
            { step: "1st", text: "Warning and content removal" },
            { step: "2nd", text: "Temporary suspension (7 days)" },
            { step: "3rd", text: "Permanent account termination" },
          ].map((row) => (
            <div
              key={row.step}
              className="flex items-center gap-4 rounded-card border border-white/10 bg-surface px-4 py-3"
            >
              <span className="rounded-pill bg-lumo-gold/15 px-3 py-1 text-xs font-bold text-lumo-gold">
                {row.step}
              </span>
              <span>{row.text}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 font-semibold text-red-300">
          Severe violations (threats, illegal content, etc.) will result in immediate permanent ban without warning.
        </p>
      </section>

      <section>
        <h2>Reporting</h2>
        <p>See something that violates these guidelines?</p>
        <ol>
          <li>Tap the &quot;...&quot; menu on any post or profile</li>
          <li>Select &quot;Report&quot;</li>
          <li>Choose the reason for your report</li>
          <li>Our team will review within 24 hours</li>
        </ol>
        <p>
          For urgent concerns, email{" "}
          <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Questions about these guidelines?</p>
        <p>
          <strong>Email:</strong> <a href="mailto:support@stayhealthiness.com">support@stayhealthiness.com</a>
          <br />
          <strong>Website:</strong> <a href="/support/">https://stayhealthiness.com/support</a>
        </p>
      </section>
    </LegalLayout>
  );
}
