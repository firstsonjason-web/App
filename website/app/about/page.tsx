"use client";

import { Heart, Shield, Zap, Users, Smartphone, Lock } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import PageHeader from "@/components/PageHeader";
import LumoVisual from "@/components/LumoVisual";
import CtaBand from "@/components/CtaBand";

const values = [
  { icon: Heart, title: "User first", desc: "Wellness outcomes beat engagement metrics." },
  { icon: Shield, title: "Privacy", desc: "Your data stays yours. We do not sell it." },
  { icon: Zap, title: "Simplicity", desc: "One daily goal, clear rewards, no clutter." },
  { icon: Users, title: "Community", desc: "Accountability without the noise." },
];

const builtFor = [
  {
    icon: Smartphone,
    title: "Native on iPhone",
    body: "Built for iOS 17+ with Sign in with Apple, push reminders, and Screen Time APIs when you opt in.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Usage data stays in your account. Community sharing is always your choice.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <PageHeader
            title="Technology should give time back"
            description="LumoLife helps you build healthier phone habits with one daily goal, focus sessions, and Lumo, a companion that grows with your streaks."
          />
          <LumoVisual size="lg" caption="Lumo grows when you keep your promises to yourself." />
        </div>

        <SectionReveal className="mt-24 grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-white/10 bg-surface p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white">The problem</h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Most apps compete for attention. That leaves people drained, distracted, and unsure how to change.
            </p>
          </div>
          <div className="rounded-card border border-lumo-teal/20 bg-lumo-teal/5 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white">Our approach</h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Positive reinforcement beats guilt. Small wins, visible progress, and optional Screen Time data when you want it.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal className="mt-24">
          <h2 className="text-3xl font-bold text-white">What we stand for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-card border border-white/10 bg-surface/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lumo-teal/10 text-lumo-teal">
                  <Icon size={20} aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal className="my-24">
          <h2 className="text-3xl font-bold text-white">Built for iPhone</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {builtFor.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-card border border-white/10 bg-surface p-8">
                <Icon className="text-lumo-teal" size={24} aria-hidden />
                <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
      <CtaBand title="Meet Lumo on your iPhone" description="Download LumoLife and pick your first daily goal today." />
    </div>
  );
}
