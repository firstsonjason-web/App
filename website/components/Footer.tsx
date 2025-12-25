import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image 
                  src="/icon.png" 
                  alt="Pabo Focus Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-text-primary">Pabo Focus</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Transform your relationship with technology and build healthier digital habits. Stay Healthy, Be Happy.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/features" className="text-text-secondary hover:text-accent transition-colors text-sm">Features</Link></li>
              <li><Link href="/#download" className="text-text-secondary hover:text-accent transition-colors text-sm">Download</Link></li>
              <li><Link href="/about" className="text-text-secondary hover:text-accent transition-colors text-sm">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/support" className="text-text-secondary hover:text-accent transition-colors text-sm">Help Center</Link></li>
              <li><Link href="/support#faq" className="text-text-secondary hover:text-accent transition-colors text-sm">FAQ</Link></li>
              <li><Link href="/support#contact" className="text-text-secondary hover:text-accent transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy-policy" className="text-text-secondary hover:text-accent transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-text-secondary hover:text-accent transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} Pabo Focus. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
