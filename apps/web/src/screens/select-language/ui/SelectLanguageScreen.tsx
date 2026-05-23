"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

function Flag3x2({ country }: { country: 'it' | 'en' }) {
  if (country === 'it') {
    return (
      <svg width="45" height="30" viewBox="0 0 3 2" style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        <rect width="1" height="2" fill="#008c45"/>
        <rect x="1" width="1" height="2" fill="#f4f9ff"/>
        <rect x="2" width="1" height="2" fill="#cd212a"/>
      </svg>
    );
  }
  
  return (
    <svg width="45" height="30" viewBox="0 0 60 40" style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#c8102e" strokeWidth="4"/>
      <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v40 M0,20 h60" stroke="#c8102e" strokeWidth="6"/>
    </svg>
  );
}

export default function SelectLanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [systemLang, setSystemLang] = useState<'en' | 'it'>('en');
  const [isSystemLangDetected, setIsSystemLangDetected] = useState(false);

  useEffect(() => {
    const lang = navigator.language.split('-')[0];
    setSystemLang(lang === 'it' ? 'it' : 'en');
    setIsSystemLangDetected(true);
  }, []);

  const currentLang = i18n.language || 'en';

  const selectLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('grovkornet-lang', lang);
    document.cookie = `grovkornet-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }, [i18n, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        backgroundImage: "radial-gradient(circle at center, #141416 0%, #0a0a0a 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4rem 2rem",
        fontFamily: "var(--font-body, sans-serif)",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 82, 56, 0.08) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      ></div>

      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              opacity: 0.6,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
              padding: 0,
            }}
          >
            {t("select_language.back")}
          </button>
          <h1
            style={{
              fontFamily: "var(--font-heading, sans-serif)",
              fontSize: "2.2rem",
              fontWeight: 700,
              letterSpacing: "-1px",
              margin: "1rem 0 0 0",
            }}
          >
            {t("select_language.title")}
          </h1>
        </div>

        {/* System Language Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-secondary, #9e9ea7)",
              margin: 0,
            }}
          >
            {t("select_language.system_title")}
          </h2>
          <button
            onClick={() => selectLanguage(systemLang)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255, 82, 56, 0.04)",
              border: "1px solid rgba(255, 82, 56, 0.2)",
              borderRadius: "20px",
              padding: "1.2rem 1.5rem",
              cursor: "pointer",
              color: "#ffffff",
              width: "100%",
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 82, 56, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 82, 56, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 82, 56, 0.04)";
              e.currentTarget.style.borderColor = "rgba(255, 82, 56, 0.2)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <Flag3x2 country={systemLang} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  {systemLang === 'it' ? 'Italiano' : 'English'}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary, #9e9ea7)" }}>
                  {t("select_language.system_detected")}
                </span>
              </div>
            </div>
            {isSystemLangDetected && currentLang === systemLang && (
              <span style={{ color: "#ff5238", display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {/* Separator Line */}
        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", width: "100%" }}></div>

        {/* All Languages Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h2
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-secondary, #9e9ea7)",
              margin: 0,
            }}
          >
            {t("select_language.all_languages")}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {/* English */}
            <button
              onClick={() => selectLanguage('en')}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: currentLang === 'en' ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)",
                border: currentLang === 'en' ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                padding: "1.1rem 1.5rem",
                cursor: "pointer",
                color: "#ffffff",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentLang === 'en' ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)";
                e.currentTarget.style.borderColor = currentLang === 'en' ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <Flag3x2 country="en" />
                <span style={{ fontSize: "1.05rem", fontWeight: currentLang === 'en' ? 600 : 400 }}>
                  English
                </span>
              </div>
              {currentLang === 'en' && (
                <span style={{ color: "#ff5238", display: "flex", alignItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>

            {/* Italiano */}
            <button
              onClick={() => selectLanguage('it')}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: currentLang === 'it' ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)",
                border: currentLang === 'it' ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                padding: "1.1rem 1.5rem",
                cursor: "pointer",
                color: "#ffffff",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentLang === 'it' ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)";
                e.currentTarget.style.borderColor = currentLang === 'it' ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <Flag3x2 country="it" />
                <span style={{ fontSize: "1.05rem", fontWeight: currentLang === 'it' ? 600 : 400 }}>
                  Italiano
                </span>
              </div>
              {currentLang === 'it' && (
                <span style={{ color: "#ff5238", display: "flex", alignItems: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
