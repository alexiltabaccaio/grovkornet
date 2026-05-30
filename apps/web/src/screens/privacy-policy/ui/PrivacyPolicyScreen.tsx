"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@shared/ui/LanguageSwitcher";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

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
        overflowX: "hidden",
        position: "relative"
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 82, 56, 0.08) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      ></div>

      <div
        style={{
          maxWidth: "720px",
          width: "100%",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderBottom: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))", paddingBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link 
              href="/" 
              style={{ 
                color: "#ffffff", 
                opacity: 0.6, 
                textDecoration: "none",
                fontSize: "0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              {t("privacy.back_to_home")}
            </Link>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-1.5px", margin: 0, marginTop: "1rem" }}>
            {t("privacy.title")}
          </h1>
          <p style={{ opacity: 0.5, fontSize: "0.9rem", margin: 0 }}>
            {t("privacy.last_updated")}
          </p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.7", fontSize: "1rem", opacity: 0.85 }}>
          <p dangerouslySetInnerHTML={{ __html: t("privacy.intro") }}></p>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              {t("privacy.section1.title")}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: t("privacy.section1.content") }}></p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              {t("privacy.section2.title")}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: t("privacy.section2.content") }}></p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              {t("privacy.section3.title")}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: t("privacy.section3.content") }}></p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              {t("privacy.section4.title")}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: t("privacy.section4.content") }}></p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              {t("privacy.section5.title")}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: t("privacy.section5.content") }}></p>
          </section>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))", paddingTop: "2rem", marginTop: "2rem", textAlign: "center", opacity: 0.5, fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div suppressHydrationWarning>
            © {new Date().getFullYear()} Grovkornet. {t("privacy.footer")}
          </div>
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
