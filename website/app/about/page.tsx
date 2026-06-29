"use client";

import Image from "next/image";
import { Heart, Shield, Zap, Users } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const values = [
  { icon: Heart, title: "User first", desc: "Wellness outcomes beat engagement metrics." },
  { icon: Shield, title: "Privacy", desc: "Your data stays yours. We do not sell it." },
  { icon: Zap, title: "Simplicity", desc: "One daily goal, clear rewards, no clutter." },
  { icon: Users, title: "Community", desc: "Accountability without the noise." },
];

export default function AboutPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionReveal>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Technology should give time back
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
              LumoLife helps you build healthier phone habits with one daily goal, focus sessions, and Lumo, a companion that grows with your streaks.
            </p>
          </SectionReveal>
          <SectionReveal className="relative aspect-[4/3] overflow-hidden rounded-card border border-white/10">
            <Image
              src="https://picsum.photos/seed/lumolife-about-mission/900/675"
              alt="Person taking a mindful break from their phone outdoors"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </SectionReveal>
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
      </div>
    </div>
  );
}
