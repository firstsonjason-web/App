"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Flame,
  Users,
  Trophy,
  Shield,
  LineChart,
  MessageSquare,
} from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import PageHeader from "@/components/PageHeader";
import AppStoreButton from "@/components/AppStoreButton";
import CtaBand from "@/components/CtaBand";
import BentoTile from "@/components/BentoTile";
import LumoVisual from "@/components/LumoVisual";
import { LUMO_MASCOT } from "@/lib/site";

type FeatureBlockProps = {
  title: string;
  desc: string;
  list: string[];
  visual: React.ReactNode;
  reverse?: boolean;
};

function FeatureBlock({ title, desc, list, visual, reverse }: FeatureBlockProps) {
  return (
    <SectionReveal
      className={`grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-text-secondary">{desc}</p>
        <ul className="mt-8 space-y-3">
          {list.map((item) => (
            <li key={item} className="flex gap-3 text-text-secondary">
              <CheckCircle2 className="mt-0.5 shrink-0 text-lumo-teal" size={18} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {visual}
    </SectionReveal>
  );
}

function FeaturePanel({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-card border border-white/10 ${gradient}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.08),transparent_50%)]" aria-hidden />
      <div className="relative flex h-full items-center justify-center p-8">{children}</div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Built for real focus habits"
          description="Goals, Screen Time, Lumo progression, and community tools in one iOS app."
        />

        <div className="mt-8 divide-y divide-white/10">
          <FeatureBlock
            title="Daily goals"
            desc="Pick one target that fits your day. Earn points by difficulty and keep streaks alive."
            list={[
              "Recommended templates or custom goals",
              "Daily, weekly, and monthly options",
              "Reminders when you want them",
            ]}
            visual={
              <FeaturePanel gradient="bg-gradient-to-br from-lumo-teal/20 via-lumo-deep/50 to-lumo-ink">
                <div className="grid w-full max-w-xs gap-3">
                  {["Read 20 minutes", "Walk outside", "No social before noon"].map((goal) => (
                    <div
                      key={goal}
                      className="rounded-xl border border-white/10 bg-surface/80 px-4 py-3 text-sm text-white"
                    >
                      {goal}
                    </div>
                  ))}
                </div>
              </FeaturePanel>
            }
          />
          <FeatureBlock
            reverse
            title="Screen Time insights"
            desc="See usage trends after you grant iOS Screen Time permission. No selling your data."
            list={[
              "App-by-app breakdown",
              "Weekly and monthly trends",
              "Optional daily limits",
            ]}
            visual={
              <FeaturePanel gradient="bg-gradient-to-br from-lumo-mid/25 to-lumo-ink">
                <ul className="w-full max-w-xs space-y-3 text-left text-sm text-white">
                  <li className="flex justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-3">
                    <span>Social</span>
                    <span className="text-text-secondary">Most used</span>
                  </li>
                  <li className="flex justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-3">
                    <span>Video</span>
                    <span className="text-text-secondary">Trending down</span>
                  </li>
                  <li className="flex justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-3">
                    <span>Everything else</span>
                    <span className="text-text-secondary">Weekly view</span>
                  </li>
                </ul>
              </FeaturePanel>
            }
          />
        </div>

        <SectionReveal className="mt-20">
          <h2 className="text-3xl font-bold text-white">Everything in the app</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <BentoTile
              title="Lumo progression"
              body="Points unlock stats, skins, and cosmetics for your companion."
              icon={Flame}
              gradient="bg-gradient-to-br from-lumo-gold/15 via-lumo-deep/40 to-lumo-ink"
              className="md:col-span-2 md:row-span-2 min-h-[280px]"
            >
              <div className="pointer-events-none absolute inset-x-8 top-6 mx-auto aspect-square max-h-[220px]">
                <Image src={LUMO_MASCOT} alt="" fill className="object-contain" aria-hidden />
              </div>
            </BentoTile>
            <BentoTile
              title="Community"
              body="Posts, groups, and shared challenges."
              icon={Users}
              gradient="bg-gradient-to-br from-lumo-deep/40 to-lumo-ink"
              className="min-h-[200px]"
              delay={0.05}
            />
            <BentoTile
              title="Rankings"
              body="Friends and global leaderboards."
              icon={Trophy}
              gradient="bg-gradient-to-br from-lumo-mid/20 to-lumo-ink"
              className="min-h-[200px]"
              delay={0.1}
            />
          </div>
        </SectionReveal>

        <FeatureBlock
          title="Hyper Focus sessions"
          desc="Block distracting apps, run a timed session, and claim bonus points when you finish."
          list={[
            "Powered by Apple Screen Time APIs",
            "Pending points until session completes",
            "Works alongside your daily goal",
          ]}
          visual={
            <FeaturePanel gradient="bg-gradient-to-br from-lumo-teal/15 to-lumo-ink">
              <div className="text-center">
                <Shield className="mx-auto text-lumo-teal" size={40} aria-hidden />
                <p className="mt-4 text-lg font-semibold text-white">Focus session active</p>
                <p className="mt-2 text-sm text-text-secondary">Distractions blocked until you finish</p>
              </div>
            </FeaturePanel>
          }
        />

        <div className="grid gap-8 py-16 lg:grid-cols-2">
          <SectionReveal>
            <div className="h-full rounded-card border border-white/10 bg-surface p-8">
              <LineChart className="text-lumo-teal" size={24} aria-hidden />
              <h2 className="mt-4 text-2xl font-bold text-white">Monthly reports</h2>
              <p className="mt-3 text-text-secondary">
                See streaks, goal completion, and Screen Time trends in one monthly snapshot.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.08}>
            <div className="h-full rounded-card border border-white/10 bg-surface p-8">
              <MessageSquare className="text-lumo-teal" size={24} aria-hidden />
              <h2 className="mt-4 text-2xl font-bold text-white">Moderated community</h2>
              <p className="mt-3 text-text-secondary">
                Report, block, and community guidelines keep the feed supportive, not noisy.
              </p>
            </div>
          </SectionReveal>
        </div>

        <SectionReveal className="mb-24 rounded-card border border-lumo-teal/20 bg-gradient-to-br from-lumo-deep/40 to-surface p-10 text-center md:p-14">
          <Shield className="mx-auto text-lumo-teal" size={28} aria-hidden />
          <h2 className="mt-4 text-3xl font-bold text-white">Try it on iPhone</h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Pro is included for all signed-in users in the current App Store release.
          </p>
          <div className="mt-8 flex justify-center">
            <AppStoreButton />
          </div>
        </SectionReveal>
      </div>
      <CtaBand title="Download LumoLife" description="One daily goal. One companion. Free Pro access in this release." />
    </div>
  );
}
