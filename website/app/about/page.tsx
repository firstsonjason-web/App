"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl font-extrabold text-text-primary mb-6"
          >
            Our Mission
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            We believe technology should empower us, not overwhelm us. Pabo Focus was created to help people reclaim their time and build a healthier relationship with their digital devices.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <div className="bg-surface p-12 rounded-[3rem] border border-gray-100">
            <h2 className="text-3xl font-bold text-text-primary mb-6">The Problem</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              In today's hyper-connected world, we spend an average of 7 hours a day on screens. This constant connectivity often leads to decreased focus, increased anxiety, and a disconnect from the physical world.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Most apps are designed to keep us hooked. We wanted to build something different—an app that helps you put your phone down.
            </p>
          </div>
          <div className="bg-accent/5 p-12 rounded-[3rem] border border-accent/10">
            <h2 className="text-3xl font-bold text-text-primary mb-6">Our Solution</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Pabo Focus uses behavioral science and gamification to make digital wellness engaging and rewarding. We don't just track time; we help you set meaningful goals and find joy in offline activities.
            </p>
            <p className="text-text-secondary leading-relaxed">
              By focusing on positive reinforcement rather than restriction, we help users build lasting habits that stick.
            </p>
          </div>
        </div>

        <div className="mb-32">
          <h2 className="text-4xl font-bold text-text-primary text-center mb-16">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Heart className="text-red-500" />, title: "User First", desc: "Your wellness is our top priority." },
              { icon: <Shield className="text-blue-500" />, title: "Privacy", desc: "Your data is yours. We never sell it." },
              { icon: <Zap className="text-yellow-500" />, title: "Simplicity", desc: "Powerful tools, easy to use." },
              { icon: <Users className="text-purple-500" />, title: "Community", desc: "Better together, supporting each other." },
            ].map((v, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-surface shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-50">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{v.title}</h3>
                <p className="text-text-secondary text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
