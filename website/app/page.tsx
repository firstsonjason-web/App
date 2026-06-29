"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Target,
  Flame,
  Users,
  Sparkles,
  Shield,
  BarChart3,
} from "lucide-react";
import AppStoreButton from "@/components/AppStoreButton";
import SectionReveal from "@/components/SectionReveal";
import LumoVisual from "@/components/LumoVisual";
import BentoTile from "@/components/BentoTile";
import CtaBand from "@/components/CtaBand";
import { LUMO_MASCOT, proFeatures } from "@/lib/site";

const steps = [
  {
    title: "Download LumoLife",
    body: "Sign in with Apple or email. Pro access is included in this release.",
  },
  {
    title: "Pick one daily goal",
    body: "Start small. Earn points and build a streak Lumo reacts to.",
  },
  {
    title: "Focus and grow",
    body: "Run hyperfocus sessions, unlock cosmetics, and track Screen Time when you choose.",
  },
];

const progression = [
  { label: "Easy goal", value: "10 pts", note: "Good for warm-up days" },
  { label: "Medium goal", value: "25 pts", note: "Your default stretch" },
  { label: "Hard goal", value: "50 pts", note: "When you want a real win" },
];

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="marketing-grid overflow-hidden">
      <section className="relative min-h-[100dvh] pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-8 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-12">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-pill border border-lumo-teal/30 bg-lumo-teal/10 px-3 py-1 text-xs font-semibold text-lumo-teal">
              <Sparkles size={14} aria-hidden />
              Pro included free right now
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Meet Lumo, your tiny focus companion
            </h1>
            <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-text-secondary">
              Set one daily goal, run focus sessions, and watch Lumo grow with your streaks and stats.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AppStoreButton />
              <Link
                href="/features"
                className="rounded-2xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-lumo-teal/50 hover:text-lumo-teal active:scale-[0.98]"
              >
                See features
              </Link>
            </div>
          </motion.div>

          <LumoVisual
            size="xl"
            priority
            caption="Your companion lights up when you show up."
          />
        </div>
      </section>

      <SectionReveal className="border-y border-white/10 bg-white/[0.02] py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-sm text-text-secondary sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <Shield size={16} className="text-lumo-teal" aria-hidden />
            Screen Time optional
          </span>
          <span className="flex items-center gap-2">
            <BarChart3 size={16} className="text-lumo-teal" aria-hidden />
            Goals and streaks
          </span>
          <span className="flex items-center gap-2">
            <Users size={16} className="text-lumo-teal" aria-hidden />
            Community with moderation
          </span>
        </div>
      </SectionReveal>

      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Everything Lumo reacts to
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Goals, focus, cosmetics, and community in one calm iOS app.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(180px,auto)]">
            <BentoTile
              title="Daily goals that stick"
              body="One clear target per day. Points scale with difficulty."
              icon={Target}
              gradient="bg-gradient-to-br from-lumo-teal/25 via-lumo-deep/40 to-lumo-ink"
              className="md:col-span-2 md:row-span-2"
              delay={0}
            />
            <BentoTile
              title="Hyper Focus mode"
              body="Block distractions and claim pending points when you finish."
              icon={Flame}
              gradient="bg-gradient-to-br from-lumo-mid/30 to-lumo-ink"
              className="md:col-span-1"
              delay={0.05}
            />
            <BentoTile
              title="Grow with Lumo"
              body="Upgrade stats, unlock skins, and equip cosmetics."
              icon={Sparkles}
              gradient="bg-gradient-to-br from-lumo-gold/15 via-lumo-deep/30 to-lumo-ink"
              className="md:col-span-1 min-h-[220px]"
              delay={0.1}
            >
              <div className="pointer-events-none absolute right-2 top-2 h-24 w-24 opacity-90 md:h-28 md:w-28">
                <Image src={LUMO_MASCOT} alt="" fill className="object-cover" aria-hidden />
              </div>
            </BentoTile>
            <BentoTile
              title="Community and challenges"
              body="Share progress, join groups, and climb rankings."
              icon={Users}
              gradient="bg-gradient-to-br from-lumo-deep/50 via-lumo-ink to-lumo-ink"
              className="md:col-span-2"
              delay={0.15}
            />
          </div>

          <div className="mt-10 text-center">
            <Link href="/features" className="text-sm font-semibold text-lumo-teal hover:underline">
              Full feature list
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <SectionReveal>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Points Lumo actually uses</h2>
            <p className="mt-4 max-w-lg text-text-secondary">
              Complete your daily goal to feed Lumo. Difficulty maps to points so small wins still count.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {progression.map((item) => (
                <div
                  key={item.label}
                  className="rounded-card border border-white/10 bg-surface/80 p-4 text-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-lumo-teal">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-text-secondary">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-text-secondary">
              Hyper Focus adds 1 point per 3 minutes while a session runs.
            </p>
          </SectionReveal>
          <LumoVisual size="lg" caption="Stats, skins, and cosmetics unlock as you keep showing up." />
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Start in three steps</h2>
          </SectionReveal>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <SectionReveal key={step.title} delay={i * 0.08}>
                <div className="rounded-card border border-white/10 bg-surface p-8">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lumo-teal/15 text-sm font-bold text-lumo-teal">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{step.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionReveal>
            <blockquote className="text-xl font-medium leading-relaxed text-white md:text-2xl">
              &ldquo;I finally have one goal instead of ten habits I abandon by Tuesday.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-text-secondary">
              Mara Okonkwo, designer and early LumoLife user
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Pro features, included free</h2>
            <p className="mt-4 text-text-secondary">
              Rankings, reports, community tools, and Screen Time tracking are unlocked for every signed-in user in this release.
            </p>
          </SectionReveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proFeatures.map((feature, i) => (
              <SectionReveal key={feature.title} delay={i * 0.04}>
                <div className="h-full rounded-card border border-white/10 bg-surface/60 p-6">
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feature.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-lumo-teal hover:underline">
              Pricing details
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
