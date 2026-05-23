"use client";

import React from "react";
import Image from "next/image";

export default function ComingSoonPage() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        backgroundImage: "radial-gradient(circle at center, #141416 0%, #0a0a0a 100%)",
        overflow: "hidden"
      }}
    >
      {/* Background Glows (defined inline for absolute consistency) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 82, 56, 0.12) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(255, 139, 56, 0.06) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      ></div>

      {/* Main Centered Layout Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "2.5rem",
          zIndex: 10,
          maxWidth: "640px",
          width: "90%",
          animation: "fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
      >
        {/* Brand Information Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          {/* Logo and Brand Title Row */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1.25rem", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle, rgba(255, 82, 56, 0.15) 0%, rgba(0,0,0,0) 70%)"
              }}
            >
              <Image
                src="/logo-transparent.png"
                alt="Grovkornet Logo"
                width={64}
                height={64}
                priority
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(255, 82, 56, 0.3))"
                }}
              />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                fontWeight: 700,
                letterSpacing: "-2px",
                lineHeight: 1.1,
                margin: 0,
                color: "#ffffff"
              }}
            >
              Grovkornet
            </h1>
          </div>
          
          <p
            style={{
              color: "#ffffff",
              opacity: 0.9,
              fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
              fontWeight: 500,
              letterSpacing: "-0.3px",
              margin: 0
            }}
          >
            Cinematic Analog Film Emulation
          </p>
        </div>

        {/* Coming Soon Badge */}
        <div className="nav-badge" style={{ alignSelf: "center", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
          <div className="nav-badge-indicator"></div>
          Coming Soon to Android
        </div>

        {/* Description */}
        <p
          style={{
            color: "#ffffff",
            opacity: 0.8,
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            lineHeight: "1.7",
            margin: 0,
            maxWidth: "460px"
          }}
        >
          Capture professional cinema footage with a custom C++/Kotlin native rendering engine for real-time analog film look.
        </p>

      </div>

      {/* Footer Info (Pushed to the very bottom of the page) */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.8rem",
          color: "#ffffff",
          opacity: 0.5,
          width: "90%",
          maxWidth: "640px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 10,
          borderTop: "1px solid var(--border-glass)",
          paddingTop: "1.5rem"
        }}
      >
        <div>
          © {new Date().getFullYear()} Grovkornet. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a 
            href="/privacy-policy" 
            style={{ 
              color: "#ffffff", 
              textDecoration: "none", 
              transition: "opacity 0.2s" 
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
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

