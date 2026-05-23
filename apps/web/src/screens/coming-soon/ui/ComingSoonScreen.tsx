"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@shared/ui/LanguageSwitcher";

export default function ComingSoonScreen() {
  const { t } = useTranslation();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const hasAnimatedBefore = sessionStorage.getItem("grovkornet-animated") === "true";
    if (!hasAnimatedBefore) {
      setShouldAnimate(true);
      sessionStorage.setItem("grovkornet-animated", "true");
    }
  }, []);

  return (
    <div className="coming-soon-wrapper">
      {/* Background Glows */}
      <div className="coming-soon-glow-1"></div>
      <div className="coming-soon-glow-2"></div>

      {/* Main Centered Layout Container */}
      <div 
        className={`coming-soon-content ${shouldAnimate ? "animate-first" : ""}`}
      >        {/* Brand Information Section */}
        <div className="coming-soon-brand">
          {/* Logo Font Row */}
          <div className="coming-soon-logo-container">
            <Image
              src="/font-transparent.png"
              alt="Grovkornet Logo"
              width={500}
              height={100}
              priority
              className="coming-soon-logo-image"
            />
          </div>
          
          <h2 className="coming-soon-subtitle">
            {t("home.subtitle")}
          </h2>
        </div>

        {/* Coming Soon Badge */}
        <div className="nav-badge" style={{ alignSelf: "center", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
          {t("home.coming_soon_badge")}
        </div>

        {/* Description */}
        <p className="coming-soon-desc">
          {t("home.description")}
        </p>

      </div>

      {/* Footer Info (Pushed to the very bottom of the page) */}
      <div className="coming-soon-footer">
        <div suppressHydrationWarning>
          © {new Date().getFullYear()} Grovkornet. {t("home.footer.rights")}
        </div>
        <div className="coming-soon-footer-links">
          <a href="/privacy-policy" className="coming-soon-footer-link">
            {t("home.footer.privacy_policy")}
          </a>
          <span>•</span>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
