"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Zap, Crown, Sparkles } from 'lucide-react';

const plans = [
  {
    name: "Free",
    icon: <Zap className="text-gray-400" size={28} />,
    price: "$0",
    period: "forever",
    description: "Get started with the essentials",
    color: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    features: [
      { text: "Up to 3 daily activities", included: true },
      { text: "Basic goal tracking", included: true },
      { text: "Points & leveling system", included: true },
      { text: "Community posts (view only)", included: true },
      { text: "Screen time tracking", included: false },
      { text: "Rankings & leaderboards", included: false },
      { text: "Community board access", included: false },
      { text: "Detailed reports", included: false },
      { text: "Create community groups", included: false },
      { text: "Unlimited friends", included: false },
    ],
  },
  {
    name: "Daily Plan",
    icon: <Crown className="text-accent" size={28} />,
    price: null, // Dynamic
    period: "per month",
    description: "For focused individuals",
    color: "from-accent/5 to-accent/10",
    borderColor: "border-accent/30",
    badge: "Popular",
    features: [
      { text: "Up to 6 daily activities", included: true },
      { text: "Advanced goal tracking", included: true },
      { text: "Points & leveling system", included: true },
      { text: "Full community access", included: true },
      { text: "Screen time tracking", included: true },
      { text: "Rankings & leaderboards", included: true },
      { text: "Community board access", included: true },
      { text: "Unlimited friends", included: true },
      { text: "Detailed reports", included: false },
      { text: "Create community groups", included: false },
    ],
  },
  {
    name: "Prof Plan",
    icon: <Sparkles className="text-yellow-500" size={28} />,
    price: null, // Dynamic
    period: "per month",
    description: "Everything, unlimited",
    color: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-300",
    badge: "Best Value",
    features: [
      { text: "Unlimited daily activities", included: true },
      { text: "Advanced goal tracking", included: true },
      { text: "Points & leveling system", included: true },
      { text: "Full community access", included: true },
      { text: "Screen time tracking", included: true },
      { text: "Rankings & leaderboards", included: true },
      { text: "Community board access", included: true },
      { text: "Unlimited friends", included: true },
      { text: "Detailed reports & insights", included: true },
      { text: "Create community groups", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-background pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-extrabold text-text-primary mb-6"
          >
            Simple, Transparent <br />
            <span className="text-accent">Pricing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary max-w-3xl mx-auto"
          >
            Pro features are included free in the current App Store release. Paid subscriptions may return in a future update.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative bg-gradient-to-b ${plan.color} rounded-[2rem] p-8 border-2 ${plan.borderColor} ${plan.badge ? 'shadow-xl scale-[1.02]' : 'shadow-sm'} hover:shadow-xl transition-all`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{plan.name}</h3>
              </div>

              <p className="text-text-secondary mb-6">{plan.description}</p>

              <div className="mb-8">
                {plan.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-text-primary">{plan.price}</span>
                    <span className="text-text-secondary">/ {plan.period}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-text-primary">Available in app</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 size={18} className="text-secondary flex-shrink-0" />
                    ) : (
                      <X size={18} className="text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-text-secondary" : "text-gray-400"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/#download"
                className={`block text-center py-3.5 rounded-2xl font-bold transition-all ${
                  plan.badge
                    ? 'bg-accent text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-white text-text-primary border-2 border-gray-200 hover:border-accent hover:text-accent'
                }`}
              >
                {plan.price === "$0" ? "Get Started" : "Start Free Trial"}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Pricing FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is the app really free right now?",
                a: "Yes. The current App Store release includes Pro features for all signed-in users at no charge. In-app purchases are not offered in this version.",
              },
              {
                q: "Will subscriptions come back later?",
                a: "We may enable optional paid plans in a future release. If we do, we'll update this page and the in-app experience before any charges apply.",
              },
              {
                q: "How do I delete my account?",
                a: "Open Profile → Account & Privacy in the app and choose Delete Account. This permanently removes your data from our servers.",
              },
              {
                q: "How do I contact support?",
                a: "Email support@stayhealthiness.com or visit the Support page on this site.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-surface p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-text-primary mb-3">{faq.q}</h3>
                <p className="text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
