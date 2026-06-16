"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@shared/ui/LanguageSwitcher";

export default function HomeScreen() {
  const { t } = useTranslation();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasAnimatedBefore = sessionStorage.getItem("grovkornet-animated") === "true";
    if (!hasAnimatedBefore) {
      setShouldAnimate(true);
      sessionStorage.setItem("grovkornet-animated", "true");
    }
  }, []);

  return (
    <div className="home-wrapper">
      {/* Background Glows */}
      <div className="home-glow-1"></div>
      <div className="home-glow-2"></div>

      {/* Main Centered Layout Container */}
      <div 
        className={`home-content ${shouldAnimate ? "animate-first" : ""}`}
        style={{ opacity: isMounted ? '' : 0 }}
      >        {/* Brand Information Section */}
        <div className="home-brand">
          {/* Logo Font Row */}
          <div className="home-logo-container">
            <Image
              src="/font-transparent.png"
              alt="Grovkornet Logo"
              width={500}
              height={100}
              priority
              className="home-logo-image"
            />
          </div>
          
          <h2 className="home-subtitle">
            {t("home.subtitle")}
          </h2>
        </div>

        {/* Coming Soon Badge */}
        <div className="nav-badge" style={{ alignSelf: "center", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
          {t("home.coming_soon_badge")}
        </div>

        {/* Description */}
        <p className="home-desc">
          {t("home.description")}
        </p>

        {/* Discord Call to Action */}
        <div className="home-cta">
          <p className="home-cta-label">
            {t("home.discord_cta_label")}
          </p>
          <a 
            href="https://discord.gg/cvYa4SmPaW" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="discord-btn"
          >
            <svg 
              className="discord-icon" 
              viewBox="0 0 127.14 96.36" 
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.73,2-1.5,2.92-2.3a75.6,75.6,0,0,0,72.06,0c.93.8,1.91,1.57,2.92,2.3a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.22,123.35,27.27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            <span>{t("home.join_discord")}</span>
          </a>
        </div>
      </div>

      {/* Footer Info (Pushed to the very bottom of the page) */}
      <div className="home-footer">
        <div suppressHydrationWarning>
          © {new Date().getFullYear()} Grovkornet. {t("home.footer.rights")}
        </div>
        <div className="home-footer-links">
          <a href="/privacy-policy" className="home-footer-link">
            {t("home.footer.privacy_policy")}
          </a>
          <span>•</span>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

