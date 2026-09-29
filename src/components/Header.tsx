'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ROUTE_MAPPINGS } from '@/utils/i18nMapping';

export function Header() {
  const pathname = usePathname();
  const isIndonesian = pathname.startsWith('/id');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const homePath = isIndonesian ? '/id' : '/';

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={homePath} className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-sm">Omni</span>
          <span>Tools</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
          {ROUTE_MAPPINGS.filter((r) => r.en !== '/').map((route) => {
            const href = isIndonesian ? route.id : route.en;
            const label = isIndonesian ? route.labelId : route.labelEn;
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Action / Language Switcher */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2">
          {ROUTE_MAPPINGS.filter((r) => r.en !== '/').map((route) => {
            const href = isIndonesian ? route.id : route.en;
            const label = isIndonesian ? route.labelId : route.labelEn;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600"
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}