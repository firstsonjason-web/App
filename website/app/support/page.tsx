"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, HelpCircle, BookOpen } from 'lucide-react';

export default function SupportPage() {
  const faqs = [
    { q: "How does Pabo Focus track my screen time?", a: "Pabo Focus uses system-level APIs to monitor app usage and screen time accurately while maintaining your privacy." },
    { q: "Is my data shared with anyone?", a: "No, your data is private and stored securely. We never sell your personal information or usage data to third parties." },
    { q: "Can I use Pabo Focus on multiple devices?", a: "Yes, if you create an account, your goals and progress will sync across all your devices." },
    { q: "How do I earn points?", a: "You earn points by completing your daily goals, maintaining streaks, and participating in community challenges." },
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
        </div>
      </div>
    </div>
  );
}
