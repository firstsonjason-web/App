"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Target, BarChart3, Zap, Users, LineChart, Sparkles, CheckCircle2 } from 'lucide-react';

const FeatureDetail = ({ title, badge, desc, list, visual, reverse = false }: any) => {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center py-20`}>
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 20 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex-1"
      >
        <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-bold mb-6">
          {badge}
        </span>
        <h2 className="text-4xl font-bold text-text-primary mb-6 leading-tight">{title}</h2>
        <p className="text-lg text-text-secondary mb-8 leading-relaxed">{desc}</p>
        <ul className="space-y-4">
          {list.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="text-secondary mt-1 flex-shrink-0" size={20} />
              <span className="text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex-1 w-full"
      >
        <div className="bg-background rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-inner">
          {visual}
        </div>
      </motion.div>
    </div>
  );
};

export default function FeaturesPage() {
  return (
    <div className="bg-background pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-extrabold text-text-primary mb-6"
          >
            Powerful Features for <br />
            <span className="text-accent">Digital Wellness</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary max-w-3xl mx-auto"
          >
            Everything you need to transform your relationship with technology and reclaim your focus.
          </motion.p>
        </div>

        {/* Features List */}
        <div className="space-y-12">
          <FeatureDetail 
            badge="Goal Setting"
            title="Set Meaningful Daily Goals"
            desc="Create personalized digital wellness goals that align with your lifestyle and values. Choose from recommended activities or create your own custom goals."
            list={[
              "Pre-built goal templates for quick start",
              "Custom goal creation with flexible parameters",
              "Daily, weekly, and monthly goal options",
              "Smart reminders to keep you on track"
            ]}
            visual={
              <div className="bg-surface rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-lg font-bold mb-6 flex items-center gap-2 text-text-primary">
                  <Target className="text-accent" /> Daily Goals
                </div>
                <div className="space-y-4">
                  {['Read for 30 minutes', 'Exercise 20 minutes', 'Meditate for 10 minutes'].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-sm">
                        {['📚', '🏃', '🧘'][i]}
                      </div>
                      <span className="font-medium text-text-secondary">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          <FeatureDetail 
            reverse
            badge="Screen Time Tracking"
            title="Monitor Your Digital Habits"
            desc="Get real-time insights into your screen time across all apps. Track your progress and see how you're improving over time."
            list={[
              "Real-time screen time tracking",
              "App-by-app usage breakdown",
              "Weekly and monthly trends",
              "Focus time vs screen time comparison"
            ]}
            visual={
              <div className="bg-surface rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-lg font-bold mb-6 flex items-center gap-2 text-text-primary">
                  <BarChart3 className="text-secondary" /> Today's Activity
                </div>
                <div className="text-center py-6">
                  <div className="text-5xl font-black text-text-primary mb-2">2h 15m</div>
                  <div className="text-text-secondary font-medium mb-6">Screen Time</div>
                  <div className="w-full h-4 bg-background rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-secondary w-[45%] rounded-full" />
                  </div>
                  <div className="text-secondary font-bold flex items-center justify-center gap-1">
                    <Zap size={16} /> ↓ 25% from yesterday
                  </div>
                </div>
              </div>
            }
          />

          <FeatureDetail 
            badge="Gamification"
            title="Earn Points & Level Up"
            desc="Stay motivated with our points and achievements system. Complete goals, maintain streaks, and unlock new levels as you progress."
            list={[
              "Earn points for completed goals",
              "Build and maintain focus streaks",
              "Unlock achievements and badges",
              "Level up and track your progress"
            ]}
            visual={
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 rounded-3xl text-white shadow-lg">
                  <div className="text-sm font-bold opacity-80 mb-1">Current Streak</div>
                  <div className="text-3xl font-black flex items-center gap-2">🔥 7 Days</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg">
                  <div className="text-sm font-bold opacity-80 mb-1">Experience Level</div>
                  <div className="text-3xl font-black flex items-center gap-2">⭐ Level 5</div>
                </div>
                <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-6 rounded-3xl text-white shadow-lg">
                  <div className="text-sm font-bold opacity-80 mb-1">Total Points</div>
                  <div className="text-3xl font-black flex items-center gap-2">🎯 1,250 pts</div>
                </div>
              </div>
            }
          />

          <FeatureDetail 
            reverse
            badge="Community"
            title="Connect with Like-Minded People"
            desc="Join a supportive community of people on the same journey. Share experiences, get motivated, and learn from others."
            list={[
              "Share your progress and achievements",
              "Find accountability partners",
              "Discover tips and success stories",
              "Join challenges and compete"
            ]}
            visual={
              <div className="bg-surface rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-lg font-bold mb-8 flex items-center gap-2 text-text-primary">
                  <Users className="text-purple-500" /> Active Community
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-background rounded-2xl border border-gray-100">
                    <div className="text-3xl font-bold text-text-primary mb-1">10K+</div>
                    <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">Members</div>
                  </div>
                  <div className="text-center p-6 bg-background rounded-2xl border border-gray-100">
                    <div className="text-3xl font-bold text-text-primary mb-1">25+</div>
                    <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">Countries</div>
                  </div>
                </div>
                <div className="mt-8 flex -space-x-3 justify-center">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-surface bg-gray-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-surface bg-accent text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    +9k
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* CTA */}
        <div className="py-32">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">Join thousands of users building healthier digital habits and reclaiming their time.</p>
              <Link 
                href="/#download" 
                className="inline-block bg-surface text-text-primary px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-transform shadow-2xl"
              >
                Download App Now
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
