import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LumoLife — Stay Healthy, Be Happy",
  description: "Meet Lumo, your tiny focus companion. Set daily goals, run focus sessions, grow Lumo's stats and cosmetics, and track Screen Time when you choose.",
  keywords: ["LumoLife", "digital wellness", "screen time", "focus", "habits", "streaks", "Lumo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
