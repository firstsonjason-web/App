import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LumoLife - Meet Lumo, your focus companion",
  description:
    "Set daily goals, run focus sessions, and grow Lumo's stats and cosmetics. Pro features included free in the current App Store release.",
  keywords: [
    "LumoLife",
    "digital wellness",
    "screen time",
    "focus",
    "habits",
    "iOS",
    "Lumo",
  ],
  openGraph: {
    title: "LumoLife",
    description: "Your tiny focus companion for healthier phone habits.",
    siteName: "LumoLife",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} font-sans`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
