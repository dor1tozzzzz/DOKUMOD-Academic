'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getEquivalentPath } from '@/utils/i18nMapping';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const isIndonesian = pathname.startsWith('/id');

  const enTarget = getEquivalentPath(pathname, 'en');
  const idTarget = getEquivalentPath(pathname, 'id');

  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
      <Link
        href={enTarget}
        className={`px-2.5 py-1 rounded-md transition-all ${
          !isIndonesian
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        EN
      </Link>
      <Link
        href={idTarget}
        className={`px-2.5 py-1 rounded-md transition-all ${
          isIndonesian
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        ID
      </Link>
    </div>
  );
}