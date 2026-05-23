"use client";

import React from "react";
import Image from "next/image";

export default function ComingSoonPage() {
  return (
    <div className="coming-soon-wrapper">
      {/* Background Glows */}
      <div className="coming-soon-glow-1"></div>
      <div className="coming-soon-glow-2"></div>

      {/* Main Centered Layout Container */}
      <div className="coming-soon-content">
        {/* Brand Information Section */}
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
            Cinematic Analog Film Emulation
          </h2>
        </div>

        {/* Coming Soon Badge */}
        <div className="nav-badge" style={{ alignSelf: "center", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
          Coming Soon to Android
        </div>

        {/* Description */}
        <p className="coming-soon-desc">
          Capture professional cinema footage with a custom C++/Kotlin native rendering engine for real-time analog film look.
        </p>

      </div>

      {/* Footer Info (Pushed to the very bottom of the page) */}
      <div className="coming-soon-footer">
        <div>
          © {new Date().getFullYear()} Grovkornet. All rights reserved.
        </div>
        <div className="coming-soon-footer-links">
          <a href="/privacy-policy" className="coming-soon-footer-link">
            Privacy Policy
          </a>
          {/* Se hai una Partita IVA / Ditta Individuale, decommenta e compila la riga sotto: */}
          {/* <span>•</span> */}
          {/* <span>P.IVA 12345678901</span> */}
        </div>
      </div>
    </div>
  );
}

