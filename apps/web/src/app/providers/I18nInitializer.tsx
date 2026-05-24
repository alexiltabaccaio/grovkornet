"use client";

import { type PropsWithChildren, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@app/providers/i18n";

export function I18nInitializer({ children, initialLang }: PropsWithChildren<{ initialLang: string }>) {
  // Synchronously set language before rendering children to prevent hydration flicker on SSR
  if (i18n.language !== initialLang) {
    i18n.changeLanguage(initialLang);
  }

  useEffect(() => {
    // Keep cookie and localStorage in sync
    document.cookie = `grovkornet-lang=${initialLang}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem("grovkornet-lang", initialLang);
  }, [initialLang]);

  // eslint-disable-next-line
  return <I18nextProvider i18n={i18n}>{children as any}</I18nextProvider>;
}
