"use client";

import SectionReveal from "@/components/SectionReveal";
import PageHeader from "@/components/PageHeader";
import AppStoreButton from "@/components/AppStoreButton";
import CtaBand from "@/components/CtaBand";
import { proFeatures } from "@/lib/site";

const faqs = [
  {
    q: "Is the app really free right now?",
    a: "Yes. Pro access is included for every signed-in user in this release.",
  },
  {
    q: "Will paid plans return?",
    a: "We may enable optional subscriptions later. We will update this page and the app before any charges apply.",
  },
  {
    q: "What happened to Free vs Pro tiers?",
    a: "This release unlocks Pro features for everyone. The app does not show in-app purchases right now.",
  },
  {
    q: "Do I need Screen Time permission?",
    a: "No. Goals and Lumo progression work without it. Screen Time unlocks usage insights and Hyper Focus blocking.",
  },
  {
    q: "How do I delete my account?",
    a: "Profile → Account & Privacy → Delete Account in the iOS app.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          centered
          title="Simple for now"
          description="Pro features are included for all signed-in users in the current App Store release. No in-app purchases or trials in this version."
        />

        <SectionReveal className="mt-14">
          <div className="rounded-card border border-lumo-teal/25 bg-gradient-to-b from-lumo-teal/10 to-surface p-10 shadow-glow-teal">
            <p className="text-sm font-semibold uppercase tracking-wide text-lumo-teal">Current release</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Pro included free</h2>
            <p className="mt-3 text-text-secondary">
              Everything below is unlocked when you sign in. No paywall in this App Store build.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {proFeatures.map((item) => (
                <li key={item.title} className="flex gap-3 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lumo-teal" aria-hidden />
                  {item.title}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex justify-center">
              <AppStoreButton />
            </div>
          </div>
        </SectionReveal>

        <SectionReveal className="mt-16">
          <h2 className="text-xl font-bold text-white">If subscriptions return later</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            We will announce pricing in the app and on this page before anything is charged. Existing users will never be surprised by a silent paywall.
          </p>
        </SectionReveal>

        <SectionReveal className="mt-16 space-y-4 pb-24">
          <h2 className="text-xl font-bold text-white">FAQ</h2>
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-card border border-white/10 bg-surface p-6">
              <h3 className="font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
            </div>
          ))}
        </SectionReveal>
      </div>
      <CtaBand />
    </div>
  );
}
