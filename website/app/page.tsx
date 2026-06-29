"use client";

import Image from "next/image";
import Link from "next/link";
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

const bento = [
  {
    title: "Daily goals that stick",
    body: "One clear target per day. Points scale with difficulty.",
    icon: Target,
    image: "https://picsum.photos/seed/lumolife-goals/800/600",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Hyper Focus mode",
    body: "Block distractions and claim pending points when you finish.",
    icon: Flame,
    image: "https://picsum.photos/seed/lumolife-focus/600/400",
    className: "md:col-span-1",
  },
  {
    title: "Grow with Lumo",
    body: "Upgrade stats, unlock skins, and equip cosmetics.",
    icon: Sparkles,
    image: "https://picsum.photos/seed/lumolife-lumo/600/400",
    className: "md:col-span-1",
  },
  {
    title: "Community and challenges",
    body: "Share progress, join groups, and climb rankings.",
    icon: Users,
    image: "https://picsum.photos/seed/lumolife-community/900/500",
    className: "md:col-span-2",
  },
];

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="marketing-grid overflow-hidden">
      {/* Hero: asymmetric split */}
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
                className="rounded-2xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-lumo-teal/50 hover:text-lumo-teal"
              >
                See features
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-lumo-teal/20 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-card ring-1 ring-white/10">
              <Image
                src="https://picsum.photos/seed/lumolife-hero-companion/900/1100"
                alt="Person taking a mindful break from their phone outdoors"
                width={900}
                height={1100}
                priority
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-lumo-ink via-lumo-ink/80 to-transparent p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">Today&apos;s focus</p>
                    <p className="text-2xl font-bold text-lumo-teal">12 day streak</p>
                  </div>
                  <div className="rounded-card border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-wide text-text-secondary">Points</p>
                    <p className="text-lg font-bold text-lumo-gold">1,240</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip below hero */}
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

      {/* Bento features */}
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
            {bento.map((item, i) => (
              <SectionReveal
                key={item.title}
                delay={i * 0.05}
                className={`group relative overflow-hidden rounded-card border border-white/10 bg-surface ${item.className}`}
              >
                <Image
                  src={item.image}
                  alt=""
                  width={800}
                  height={600}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lumo-ink via-lumo-ink/70 to-lumo-ink/20" />
                <div className="relative flex h-full min-h-[200px] flex-col justify-end p-6 md:min-h-0 md:p-8">
                  <item.icon size={22} className="mb-3 text-lumo-teal" aria-hidden />
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                    {item.body}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/features"
              className="text-sm font-semibold text-lumo-teal hover:underline"
            >
              Full feature list
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/10 bg-white/[0.02] py-24">
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

      {/* Pricing teaser */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionReveal>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Pro features, included free</h2>
            <p className="mx-auto mt-4 max-w-lg text-text-secondary">
              Rankings, reports, community tools, and Screen Time tracking are unlocked for every signed-in user in this release. No in-app purchases shown.
            </p>
            <div className="mt-8">
              <Link
                href="/pricing"
                className="text-sm font-semibold text-lumo-teal hover:underline"
              >
                Pricing details
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-lumo-mid/30 via-lumo-deep/50 to-lumo-ink" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <SectionReveal>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to meet Lumo?</h2>
            <p className="mx-auto mt-4 max-w-md text-text-secondary">
              Available on iPhone. Requires iOS 17 or later.
            </p>
            <div className="mt-8 flex justify-center">
              <AppStoreButton />
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
