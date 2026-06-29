"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import AppStoreButton from "@/components/AppStoreButton";

const navLinks = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Support", href: "/support" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-lumo-ink/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/15">
            <Image src="/icon.png" alt="" fill className="object-cover" priority />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">LumoLife</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-lumo-teal",
                pathname === link.href ? "text-white" : "text-text-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
          <AppStoreButton className="!py-2.5 !px-4 text-sm" />
        </nav>

        <button
          type="button"
          className="rounded-xl p-2 text-text-secondary hover:text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-b border-white/10 bg-lumo-ink/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-xl px-3 py-3 text-base font-medium",
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-text-secondary hover:bg-white/5 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3">
              <AppStoreButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
