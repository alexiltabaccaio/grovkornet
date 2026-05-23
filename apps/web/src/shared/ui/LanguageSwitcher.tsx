"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const currentLang = i18n.language || 'en';

  return (
    <Link 
      href="/select-language" 
      style={{
        color: 'var(--text-primary, #ffffff)',
        textDecoration: 'none',
        transition: 'opacity 0.2s',
        opacity: 0.6,
        fontSize: 'inherit',
        fontFamily: 'var(--font-mono, monospace)',
        fontWeight: 600,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
    >
      {currentLang.toUpperCase()}
    </Link>
  );
}
