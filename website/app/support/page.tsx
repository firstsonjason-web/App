"use client";

import { Mail } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { SUPPORT_EMAIL } from "@/lib/site";

const faqs = [
  {
    q: "How does LumoLife track screen time?",
    a: "After you grant permission, we use Apple's Screen Time APIs (Family Controls / DeviceActivity). Usage data is tied to your account and stored securely.",
  },
  {
    q: "Is my data shared?",
    a: "No. We do not sell personal information. See our privacy policy for processors and retention.",
  },
  {
    q: "What's included in the current release?",
    a: "Pro features are included for all signed-in users. In-app purchases are not offered in this App Store version.",
  },
  {
    q: "How do I earn points?",
    a: "Complete daily goals (10, 25, or 50 points by difficulty) and Hyper Focus sessions (1 point per 3 minutes). Points feed Lumo upgrades.",
  },
  {
    q: "How do I delete my account?",
    a: "Profile → Account & Privacy → Delete Account in the iOS app. This permanently removes your profile, goals, posts, and usage data.",
  },
  {
    q: "What happens to my data if I delete my account?",
    a: "All personal data is permanently removed from our servers. This action cannot be undone.",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Support</h1>
          <p className="mt-4 text-lg text-text-secondary">
            Answers to common questions. Need more help? Email us anytime.
          </p>
        </SectionReveal>

        <SectionReveal className="mt-10">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-pill border border-lumo-teal/30 bg-lumo-teal/10 px-5 py-3 text-sm font-semibold text-lumo-teal transition active:scale-[0.98] hover:bg-lumo-teal/15"
          >
            <Mail size={18} aria-hidden />
            {SUPPORT_EMAIL}
          </a>
        </SectionReveal>

        <div id="faq" className="mt-16 space-y-4">
          <SectionReveal>
            <h2 className="text-2xl font-bold text-white">FAQ</h2>
          </SectionReveal>
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-card border border-white/10 bg-surface p-6">
              <h3 className="font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
