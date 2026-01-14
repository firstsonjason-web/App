"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Smartphone, Target, Star, BarChart3, Users, Zap, Gift } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold text-text-primary leading-[1.1] mb-6">
              Stay Healthy, <br />
              <span className="text-accent">Be Happy</span>
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-lg leading-relaxed">
              Transform your relationship with technology and build healthier digital habits with Pabo Focus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="#download"
                className="bg-primary text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-accent transition-all hover:shadow-xl text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="bg-surface text-text-primary border-2 border-gray-100 px-8 py-4 rounded-2xl text-lg font-bold hover:border-accent hover:text-accent transition-all text-center"
              >
                Learn More
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-text-primary mb-1">10K+</div>
                <div className="text-sm text-text-secondary font-medium">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-text-primary mb-1">50K+</div>
                <div className="text-sm text-text-secondary font-medium">Goals Done</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-text-primary mb-1">4.8</div>
                <div className="text-sm text-text-secondary font-medium">App Rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden">
              <div className="absolute top-0 w-full h-full bg-[#FAFAFA] text-[#09090B] p-0 font-sans">
                {/* iOS Status Bar Placeholder */}
                <div className="h-12 w-full flex justify-between items-end px-8 pb-2">
                  <span className="text-xs font-bold">9:41</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-4 h-2 bg-black rounded-[1px]" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-black">PaboFocus</h3>
                      <p className="text-xs text-gray-500 font-medium">Digital Wellness Reimagined</p>
                    </div>
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Zap size={20} className="text-white fill-current" />
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <BarChart3 size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Today's Usage</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-3xl font-black text-primary">2h 15m</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Goal: 6h 00m</p>
                      </div>
                      <div className="w-12 h-12 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset="40" className="text-primary" />
                        </svg>
                        <span className="absolute text-[10px] font-bold">38%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="text-orange-500 mb-2"><Zap size={16} fill="currentColor" /></div>
                      <div className="text-xl font-black">12</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Focus Heat</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="text-primary mb-2"><Star size={16} fill="currentColor" /></div>
                      <div className="text-xl font-black">1.2k</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Points</div>
                    </div>
                  </div>

                  {/* Navigation Bar Placeholder */}
                  <div className="absolute bottom-6 left-6 right-6 h-12 bg-white rounded-2xl shadow-lg border border-gray-50 flex justify-around items-center">
                    <div className="text-primary"><Target size={18} /></div>
                    <div className="text-gray-300"><Users size={18} /></div>
                    <div className="text-gray-300"><Star size={18} /></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: <Target className="text-blue-500" />, title: "Set Daily Goals", desc: "Create personalized digital wellness goals that matter to you." },
    { icon: <Star className="text-yellow-500" />, title: "Earn Points", desc: "Get rewarded for completing goals and building healthy habits." },
    { icon: <BarChart3 className="text-secondary" />, title: "Track Progress", desc: "Monitor your journey with detailed insights and visualizations." },
    { icon: <Users className="text-purple-500" />, title: "Join Community", desc: "Connect with others on the same wellness journey." },
    { icon: <Zap className="text-orange-500" />, title: "Stay Mindful", desc: "Build awareness around your digital habits in real-time." },
    { icon: <Gift className="text-pink-500" />, title: "Daily Rewards", desc: "Set personal rewards to celebrate your achievements." },
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-4">Why Choose Pabo Focus?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Everything you need to build healthier digital habits and reclaim your time.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-surface p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">{f.title}</h3>
              <p className="text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { num: "1", title: "Download & Sign Up", desc: "Get started in seconds with your email or social login." },
    { num: "2", title: "Set Your Goals", desc: "Choose from recommended activities or create custom goals." },
    { num: "3", title: "Track & Improve", desc: "Monitor your progress and build lasting healthy habits." },
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-4">How It Works</h2>
          <p className="text-text-secondary">Start your digital wellness journey in 3 simple steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          {steps.map((s, i) => (
            <div key={i} className="text-center relative z-10">
              <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg shadow-accent/20">
                {s.num}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">{s.title}</h3>
              <p className="text-text-secondary leading-relaxed">{s.desc}</p>
            </div>
          ))}
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gray-100 -z-0" />
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const benefits = [
    "Reduce screen time anxiety",
    "Build healthier digital habits",
    "Increase productivity and focus",
    "Improve sleep quality",
    "Strengthen real-world connections",
    "Achieve personal wellness goals",
  ];

  return (
    <section className="py-24 bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-12">Transform Your Digital Life</h2>
            <div className="space-y-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <span className="text-lg text-gray-100">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-6">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
              <div className="text-5xl font-bold mb-2">45%</div>
              <div className="text-gray-300">Average Screen Time Reduction</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
                <div className="text-3xl font-bold mb-2">7 days</div>
                <div className="text-gray-300 text-sm">Avg Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
                <div className="text-3xl font-bold mb-2">92%</div>
                <div className="text-gray-300 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Download = () => {
  return (
    <section id="download" className="py-24 bg-accent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Digital Life?</h2>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">Join thousands of happy users today and start your journey to digital wellness.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <button className="bg-surface text-text-primary px-8 py-4 rounded-2xl flex items-center gap-4 hover:scale-105 transition-transform shadow-xl">
            <Smartphone size={32} />
            <div className="text-left">
              <div className="text-xs font-medium opacity-60">Download on the</div>
              <div className="text-xl font-bold">App Store</div>
            </div>
          </button>
          <button className="bg-surface text-text-primary px-8 py-4 rounded-2xl flex items-center gap-4 hover:scale-105 transition-transform shadow-xl">
            <Zap size={32} />
            <div className="text-left">
              <div className="text-xs font-medium opacity-60">Get it on</div>
              <div className="text-xl font-bold">Google Play</div>
            </div>
          </button>
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
    </section>
  );
};

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Download />
    </div>
  );
}
