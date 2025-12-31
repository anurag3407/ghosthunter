'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <nav
        className={cn(
          "max-w-4xl mx-auto flex items-center justify-between px-6 py-3",
          "rounded-full border border-white/10",
          "bg-neutral-950/70 backdrop-blur-xl",
          "shadow-[0_0_40px_rgba(0,0,0,0.5)]",
          "transition-all duration-300",
          scrolled && "bg-neutral-950/90 border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.7)]"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">G</span>
          </div> */}
          <span className="text-base font-semibold text-white">
            GhostFounder
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark Mode Toggle Placeholder */}
          <button
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <Link
            href="/auth/signin"
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-neutral-200 transition-all"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5 text-neutral-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-neutral-950/95 backdrop-blur-xl overflow-hidden">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
              <Link
                href="/auth/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-neutral-200 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
