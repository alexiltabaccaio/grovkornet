"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
        fontFamily: "var(--font-body, sans-serif)"
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
          <Link 
            href="/" 
            style={{ 
              color: "#ffffff", 
              opacity: 0.6, 
              textDecoration: "none",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            ← Torna alla Home
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading, sans-serif)", fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-1.5px", margin: 0 }}>
            Informativa sulla Privacy
          </h1>
          <p style={{ opacity: 0.5, fontSize: "0.9rem", margin: 0 }}>
            Ultimo aggiornamento: Maggio 2026
          </p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.7", fontSize: "1rem", opacity: 0.85 }}>
          <p>
            Benvenuto su <strong>Grovkornet</strong>. La trasparenza e la tutela della tua privacy sono fondamentali per noi. Di seguito ti forniamo le informazioni sul funzionamento di questo sito web in relazione al trattamento dei dati personali.
          </p>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              1. Titolare del Trattamento dei Dati
            </h2>
            <p>
              Il Titolare del Trattamento è:<br />
              <strong>Alex Giustizieri</strong><br />
              Contatto email: <strong>alexgiustizieri@gmail.com</strong>
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              2. Assenza di Raccolta Dati Personali
            </h2>
            <p>
              Questo sito web è una pagina di presentazione informativa ("Coming Soon"). <strong>Non raccoglie, non richiede e non tratta in alcun modo dati personali degli utenti.</strong> Non sono presenti moduli di iscrizione, campi di testo per l'inserimento di dati, né newsletter.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              3. Cookie e Sistemi di Tracciamento
            </h2>
            <p>
              Questo sito non utilizza cookie di profilazione, cookie pubblicitari o altri sistemi di tracciamento dell'attività dell'utente. Eventuali cookie tecnici di sessione sono utilizzati esclusivamente per garantire il corretto caricamento e funzionamento tecnico della pagina.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              4. Link a Siti e Servizi di Terze Parti
            </h2>
            <p>
              Il sito potrebbe contenere collegamenti a piattaforme esterne (come ad esempio gli Store ufficiali per il download delle applicazioni). Cliccando su tali link, verrai reindirizzato a servizi esterni che adottano le proprie informative sulla privacy, indipendenti da questa pagina. Ti invitiamo a consultare le rispettive policy sui siti di destinazione.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
              5. I Tuoi Diritti
            </h2>
            <p>
              Poiché non raccogliamo né conserviamo alcun dato personale tramite questo sito, non sussistono archivi di dati personali su cui poter esercitare i diritti di modifica, accesso o cancellazione ai sensi del GDPR. Per qualsiasi domanda o chiarimento sul funzionamento tecnico della pagina, puoi comunque contattarci all'indirizzo email indicato al punto 1.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border-glass, rgba(255, 255, 255, 0.08))", paddingTop: "2rem", marginTop: "2rem", textAlign: "center", opacity: 0.5, fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} Grovkornet. Tutti i diritti riservati.
        </div>
      </div>
    </div>
  );
}
