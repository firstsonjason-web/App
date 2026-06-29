"use client";

import Image from "next/image";
import { CheckCircle2, Flame, Users, Trophy, Shield } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import AppStoreButton from "@/components/AppStoreButton";

type FeatureBlockProps = {
  title: string;
  desc: string;
  list: string[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

function FeatureBlock({ title, desc, list, image, imageAlt, reverse }: FeatureBlockProps) {
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
      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-white/10">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    </SectionReveal>
  );
}

export default function FeaturesPage() {
  return (
    <div className="bg-lumo-ink pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Built for real focus habits
          </h1>
          <p className="mt-5 text-lg text-text-secondary">
            Goals, Screen Time, Lumo progression, and community tools in one iOS app.
          </p>
        </SectionReveal>

        <div className="mt-8 divide-y divide-white/10">
          <FeatureBlock
            title="Daily goals"
            desc="Pick one target that fits your day. Earn points by difficulty and keep streaks alive."
            list={[
              "Recommended templates or custom goals",
              "Daily, weekly, and monthly options",
              "Reminders when you want them",
            ]}
            image="https://picsum.photos/seed/lumolife-feature-goals/900/675"
            imageAlt="Person planning a focused morning routine"
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
            image="https://picsum.photos/seed/lumolife-feature-screentime/900/675"
            imageAlt="Calm workspace with phone set aside"
          />
        </div>

        {/* Bento: 4 features, varied cells */}
        <SectionReveal className="mt-20">
          <h2 className="text-3xl font-bold text-white">Everything in the app</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {[
              {
                icon: Flame,
                title: "Lumo progression",
                body: "Points unlock stats, skins, and cosmetics for your companion.",
                image: "https://picsum.photos/seed/lumolife-lumo-pet/600/400",
                className: "md:col-span-2 md:row-span-2 min-h-[280px]",
              },
              {
                icon: Users,
                title: "Community",
                body: "Posts, groups, and shared challenges.",
                image: "https://picsum.photos/seed/lumolife-community-feed/500/400",
                className: "min-h-[200px]",
              },
              {
                icon: Trophy,
                title: "Rankings",
                body: "Friends and global leaderboards.",
                image: "https://picsum.photos/seed/lumolife-rankings/500/400",
                className: "min-h-[200px]",
              },
            ].map(({ icon: Icon, title, body, image, className }) => (
              <div
                key={title}
                className={`relative overflow-hidden rounded-card border border-white/10 ${className}`}
              >
                <Image src={image} alt="" fill className="object-cover opacity-40" sizes="33vw" aria-hidden />
                <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-lumo-ink via-lumo-ink/80 to-transparent p-6">
                  <Icon className="mb-3 text-lumo-teal" size={22} aria-hidden />
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{body}</p>
                </div>
              </div>
            ))}
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
          image="https://picsum.photos/seed/lumolife-hyperfocus/900/675"
          imageAlt="Deep work session with minimal distractions"
        />

        <SectionReveal className="mt-24 rounded-card border border-lumo-teal/20 bg-gradient-to-br from-lumo-deep/40 to-surface p-10 text-center md:p-14">
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
    </div>
  );
}
