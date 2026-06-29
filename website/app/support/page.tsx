"use client";

import Link from "next/link";
import { Mail, MessageCircle, HelpCircle, BookOpen } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
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
    q: "How do I report community content?",
    a: "Tap the menu on any post or profile, choose Report, and pick a reason. See our community guidelines for what we remove.",
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

const helpLinks = [
  {
    icon: HelpCircle,
    title: "FAQ",
    desc: "Quick answers about goals, points, and privacy.",
    href: "#faq",
  },
  {
    icon: BookOpen,
    title: "Community guidelines",
    desc: "What we allow in posts and how enforcement works.",
    href: "/community-guidelines",
  },
  {
    icon: MessageCircle,
    title: "In-app community",
    desc: "Ask questions and share tips with other users inside LumoLife.",
    href: "/features",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-0">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          centered
          title="How can we help?"
          description="Find answers below or email us directly. We reply to support requests as quickly as we can."
        />

        <SectionReveal className="mt-10 flex justify-center">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-pill border border-lumo-teal/30 bg-lumo-teal/10 px-5 py-3 text-sm font-semibold text-lumo-teal transition active:scale-[0.98] hover:bg-lumo-teal/15"
          >
            <Mail size={18} aria-hidden />
            {SUPPORT_EMAIL}
          </a>
        </SectionReveal>

        <SectionReveal className="mt-16 grid gap-4 sm:grid-cols-3">
          {helpLinks.map(({ icon: Icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="rounded-card border border-white/10 bg-surface p-5 transition hover:border-lumo-teal/30"
            >
              <Icon className="text-lumo-teal" size={22} aria-hidden />
              <h2 className="mt-3 font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm text-text-secondary">{desc}</p>
            </Link>
          ))}
        </SectionReveal>

        <div id="faq" className="mt-16 space-y-4 pb-24">
          <SectionReveal>
            <h2 className="text-2xl font-bold text-white">FAQ</h2>
          </SectionReveal>
          {faqs.map((faq, i) => (
            <SectionReveal key={faq.q} delay={i * 0.03}>
              <div className="rounded-card border border-white/10 bg-surface p-6">
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
      <CtaBand title="Still stuck?" description={`Email ${SUPPORT_EMAIL} and tell us what you were trying to do.`} />
    </div>
  );
}
