"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, HelpCircle, BookOpen, Twitter, Instagram } from 'lucide-react';

export default function SupportPage() {
  const faqs = [
    { q: "How does Pabo Focus track my screen time?", a: "Pabo Focus uses Apple's Screen Time API (ScreenTime framework) to monitor app usage accurately while maintaining your privacy. All data stays on your device and in your secure account." },
    { q: "Is my data shared with anyone?", a: "No, your data is private and stored securely using Firebase with encryption. We never sell your personal information or usage data to third parties." },
    { q: "What's included in the free plan?", a: "The free plan includes up to 3 daily activities, basic goal tracking, the points and leveling system, and viewing community posts. Upgrade to Daily or Prof for screen time tracking, rankings, and more." },
    { q: "How do subscriptions work?", a: "Both the Daily Plan and Prof Plan come with a 14-day free trial. Subscriptions are billed monthly through Apple In-App Purchases and can be managed or cancelled anytime from your Apple ID settings." },
    { q: "How do I earn points?", a: "You earn points by completing daily goals: 10 pts for Easy, 25 pts for Medium, 50 pts for Hard. Hyper Focus mode earns 1 point per 3 minutes. Build streaks to level up faster!" },
    { q: "Can I change or cancel my subscription?", a: "Yes! Go to Profile > Membership in the app to view your plan. Upgrades take effect immediately, and downgrades apply at the end of your current billing period. You can also manage subscriptions in Settings > Apple ID > Subscriptions." },
    { q: "What happens to my data if I delete my account?", a: "When you delete your account, all your personal data including goals, posts, and profile information is permanently removed from our servers. This action cannot be undone." },
  ];

  return (
    <div className="bg-background pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-text-primary mb-6">How can we help?</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: <HelpCircle className="text-accent" />, title: "Help Center", desc: "Browse our detailed guides and tutorials." },
            { icon: <MessageCircle className="text-secondary" />, title: "Community", desc: "Ask questions and share tips with other users." },
            { icon: <Mail className="text-blue-500" />, title: "Contact Us", desc: "Get direct support from our friendly team." },
          ].map((item, i) => (
            <div key={i} className="bg-surface p-8 rounded-[2rem] border border-gray-100 hover:shadow-lg transition-shadow text-center">
              <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{item.title}</h3>
              <p className="text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>

        <div id="faq" className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-text-primary mb-3">{faq.q}</h3>
                <p className="text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="contact" className="mt-32 bg-primary rounded-[3rem] p-12 lg:p-20 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Still have questions?</h2>
          <p className="text-xl text-gray-300 mb-10">We're here to help you on your digital wellness journey.</p>
          <a 
            href="mailto:support@pabofocus.com" 
            className="inline-flex items-center gap-3 bg-accent text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-transform shadow-xl"
          >
            <Mail /> Contact Support
          </a>

          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-gray-300 font-medium">Follow us for updates and tips</p>
            <div className="flex gap-6">
              <a 
                href="https://x.com/PaboFocus" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter size={24} />
              </a>
              <a 
                href="https://www.instagram.com/pabo1910/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
