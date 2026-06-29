"use client";

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Mail, Flag } from 'lucide-react';

export default function CommunityGuidelinesPage() {
    return (
        <div className="bg-background pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-text-primary mb-4">Community Guidelines</h1>
                <div className="text-text-secondary mb-12">
                    <p><strong>Last Updated:</strong> January 17, 2026</p>
                </div>

                <div className="prose prose-lg text-text-secondary max-w-none space-y-8">
                    <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-8">
                        <p className="text-emerald-800 font-medium text-lg">
                            Welcome to the LumoLife community! These guidelines help us maintain a positive, supportive environment for everyone focused on digital wellness.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            🌟 Our Values
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { title: "Respect", desc: "Treat all community members with kindness and respect" },
                                { title: "Support", desc: "Encourage others on their digital wellness journey" },
                                { title: "Authenticity", desc: "Be genuine and honest in your interactions" },
                                { title: "Privacy", desc: "Respect others' privacy and personal boundaries" }
                            ].map((value, i) => (
                                <div key={i} className="bg-surface p-4 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-text-primary">{value.title}</h3>
                                    <p className="text-sm text-text-secondary">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" /> Encouraged Behavior
                        </h2>
                        <ul className="space-y-3">
                            {[
                                "Share your progress and celebrate achievements",
                                "Offer encouragement and support to fellow users",
                                "Provide helpful tips and advice",
                                "Report content that violates these guidelines",
                                "Be patient and understanding with newcomers"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                                    <span className="text-green-800">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <XCircle className="text-red-500" /> Prohibited Content
                        </h2>
                        <p className="mb-6">The following content is strictly prohibited:</p>

                        <div className="space-y-6">
                            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                <h3 className="font-bold text-red-800 mb-3">1. Harassment & Bullying</h3>
                                <ul className="list-disc pl-6 space-y-1 text-red-700">
                                    <li>Personal attacks or insults</li>
                                    <li>Intimidation or threats</li>
                                    <li>Stalking or unwanted contact</li>
                                    <li>Doxxing or sharing private information</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                <h3 className="font-bold text-red-800 mb-3">2. Hate Speech</h3>
                                <ul className="list-disc pl-6 space-y-1 text-red-700">
                                    <li>Content promoting hatred based on race, ethnicity, religion, gender, sexual orientation, disability, or any other characteristic</li>
                                    <li>Slurs or derogatory language</li>
                                    <li>Symbols or imagery associated with hate groups</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                <h3 className="font-bold text-red-800 mb-3">3. Inappropriate Content</h3>
                                <ul className="list-disc pl-6 space-y-1 text-red-700">
                                    <li>Sexually explicit material</li>
                                    <li>Graphic violence</li>
                                    <li>Content depicting self-harm</li>
                                    <li>Drug or substance abuse promotion</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                <h3 className="font-bold text-red-800 mb-3">4. Spam & Scams</h3>
                                <ul className="list-disc pl-6 space-y-1 text-red-700">
                                    <li>Unsolicited advertisements</li>
                                    <li>Pyramid schemes or MLM promotions</li>
                                    <li>Phishing attempts</li>
                                    <li>Repetitive or meaningless posts</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                <h3 className="font-bold text-red-800 mb-3">5. Misinformation</h3>
                                <ul className="list-disc pl-6 space-y-1 text-red-700">
                                    <li>False health claims</li>
                                    <li>Dangerous advice</li>
                                    <li>Deliberately misleading content</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" /> Enforcement
                        </h2>
                        <p className="mb-4">Violations of these guidelines will result in:</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm">1st</span>
                                <span className="text-yellow-800">Warning and content removal</span>
                            </div>
                            <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-200">
                                <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-bold text-sm">2nd</span>
                                <span className="text-orange-800">Temporary suspension (7 days)</span>
                            </div>
                            <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-200">
                                <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full font-bold text-sm">3rd</span>
                                <span className="text-red-800">Permanent account termination</span>
                            </div>
                        </div>
                        <p className="mt-4 font-semibold text-red-600">
                            Severe violations (threats, illegal content, etc.) will result in immediate permanent ban without warning.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Flag className="text-blue-500" /> Reporting
                        </h2>
                        <p className="mb-4">See something that violates these guidelines?</p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Tap the &quot;...&quot; menu on any post or profile</li>
                            <li>Select &quot;Report&quot;</li>
                            <li>Choose the reason for your report</li>
                            <li>Our team will review within 24 hours</li>
                        </ol>
                        <p className="mt-4">
                            For urgent concerns, email: <a href="mailto:support@stayhealthiness.com" className="text-accent hover:underline font-semibold">support@stayhealthiness.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Mail className="text-purple-500" /> Contact Us
                        </h2>
                        <p>Questions about these guidelines?</p>
                        <p className="mt-4">
                            <strong>Email:</strong> <a href="mailto:support@stayhealthiness.com" className="text-accent hover:underline">support@stayhealthiness.com</a><br />
                            <strong>Website:</strong> <a href="/support" className="text-accent hover:underline">https://stayhealthiness.com/support</a>
                        </p>
                    </section>

                    <section className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-center text-white">
                        <p className="text-xl font-bold mb-2">
                            Thank you for helping us build a positive community!
                        </p>
                        <p className="opacity-80">
                            Together, we can create a supportive space for digital wellness.
                        </p>
                    </section>

                    <section className="border-t border-gray-100 pt-8 mt-12">
                        <p className="text-sm text-gray-500 italic text-center">
                            © 2026 LumoLife. All rights reserved.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
