import Link from "next/link";
import Image from "next/image";
import { SUPPORT_EMAIL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-lumo-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/15">
                <Image src="/icon.png" alt="" fill className="object-cover" />
              </div>
              <span className="text-lg font-bold text-white">LumoLife</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
              Meet Lumo. One daily goal, focus sessions, and a companion that grows with your habits.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Product</h2>
            <ul className="space-y-3 text-sm">
              <li><Link href="/features" className="text-text-secondary hover:text-lumo-teal">Features</Link></li>
              <li><Link href="/pricing" className="text-text-secondary hover:text-lumo-teal">Pricing</Link></li>
              <li><Link href="/#download" className="text-text-secondary hover:text-lumo-teal">Download</Link></li>
              <li><Link href="/about" className="text-text-secondary hover:text-lumo-teal">About</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Support</h2>
            <ul className="space-y-3 text-sm">
              <li><Link href="/support" className="text-text-secondary hover:text-lumo-teal">Help center</Link></li>
              <li><Link href="/community-guidelines" className="text-text-secondary hover:text-lumo-teal">Community guidelines</Link></li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-text-secondary hover:text-lumo-teal">
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Legal</h2>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="text-text-secondary hover:text-lumo-teal">Privacy policy</Link></li>
              <li><Link href="/terms" className="text-text-secondary hover:text-lumo-teal">Terms of service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} LumoLife. All rights reserved.
          </p>
          <p className="text-sm text-text-secondary">Pro included free in the current release.</p>
        </div>
      </div>
    </footer>
  );
}
