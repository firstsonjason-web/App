"use client";

import SectionReveal from "@/components/SectionReveal";
import AppStoreButton from "@/components/AppStoreButton";

export default function PricingPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Simple for now
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-text-secondary">
            Pro features are included for all signed-in users in the current App Store release. No in-app purchases or trials in this version.
          </p>
        </SectionReveal>

        <SectionReveal className="mt-14">
          <div className="rounded-card border border-lumo-teal/25 bg-gradient-to-b from-lumo-teal/10 to-surface p-10 shadow-glow-teal">
            <p className="text-sm font-semibold uppercase tracking-wide text-lumo-teal">Current release</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Pro included free</h2>
            <ul className="mt-8 space-y-3 text-text-secondary">
              {[
                "Goals, streaks, and Lumo progression",
                "Screen Time tracking (with permission)",
                "Community, rankings, and monthly reports",
                "Hyper Focus and group challenges",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lumo-teal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex justify-center">
              <AppStoreButton />
            </div>
          </div>
        </SectionReveal>

        <SectionReveal className="mt-16 space-y-6">
          <h2 className="text-xl font-bold text-white">FAQ</h2>
          {[
            {
              q: "Is the app really free right now?",
              a: "Yes. Pro access is included for every signed-in user in this release.",
            },
            {
              q: "Will paid plans return?",
              a: "We may enable optional subscriptions later. We will update this page and the app before any charges apply.",
            },
            {
              q: "How do I delete my account?",
              a: "Profile → Account & Privacy → Delete Account in the iOS app.",
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-card border border-white/10 bg-surface p-6">
              <h3 className="font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
            </div>
          ))}
        </SectionReveal>
      </div>
    </div>
  );
}
