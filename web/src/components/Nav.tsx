'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from '@/lib/site-config';
import { AuthButton } from './AuthButton';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[100] h-[72px] flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${
        scrolled
          ? 'bg-bg/85 backdrop-blur-xl border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <Link href="/" className="flex items-center gap-3 group">
        <Image
          src="/logo.png"
          alt="Aiprosol"
          width={40}
          height={40}
          priority
          className="rounded-lg group-hover:scale-105 transition-transform"
        />
        <div className="font-display font-extrabold text-xl">
          Aip<span className="text-cyan">rosol</span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-text hover:text-cyan transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <Link
          href="/search"
          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted hover:text-cyan hover:border-cyan transition-colors"
          aria-label="Search"
          title="Search · ⌘K"
        >
          <span aria-hidden>⌕</span>
        </Link>
        <AuthButton />
        <Link
          href="/roi-audit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-grad text-bg rounded-lg font-display font-bold text-sm shadow-glow-sm hover:shadow-glow-md hover:-translate-y-0.5 transition-all"
        >
          Free ROI Audit
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border text-text"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? '×' : '☰'}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-border md:hidden">
          <div className="flex flex-col p-6 gap-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-text hover:text-cyan transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-base font-medium text-text hover:text-cyan transition-colors"
              onClick={() => setOpen(false)}
            >
              Search
            </Link>
            <div className="mt-2"><AuthButton /></div>
            <Link
              href="/roi-audit"
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-grad text-bg rounded-lg font-display font-bold text-sm"
              onClick={() => setOpen(false)}
            >
              Free ROI Audit →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
