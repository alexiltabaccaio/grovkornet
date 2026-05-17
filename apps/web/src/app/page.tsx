import React from "react";

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
        backgroundColor: "var(--bg-primary)",
        overflow: "hidden"
      }}
    >
      {/* Background Glows */}
      <div className="hero-glow-1" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", position: "absolute" }}></div>
      <div className="hero-glow-2" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "700px", height: "700px", position: "absolute" }}></div>

      {/* Perfectly Centered Title */}
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
          fontWeight: 700,
          letterSpacing: "-2px",
          margin: 0,
          padding: 0,
          zIndex: 10,
          textAlign: "center"
        }}
      >
        <span className="hero-title-highlight">Coming Soon</span>
      </h1>
    </div>
  );
}
