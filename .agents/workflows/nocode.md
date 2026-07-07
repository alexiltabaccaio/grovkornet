---
description: Questo workflow attiva una modalità sicura in cui non viene modificato alcun file sorgente. Serve per esplorare idee o ottenere spiegazioni senza rischiare alterazioni del codice di produzione.
---

- **Nessuna modifica:** Non chiamare MAI i tool di modifica file (`write_to_file`, `replace_file_content`, ecc.) sui file sorgente o configurazioni.
- **Artefatti permessi:** È consentito creare/aggiornare documentazione, piani (`implementation_plan.md`), task tracking o file temporanei.
- **Spiegazioni:** Rispondi testualmente alle richieste di modifica spiegando come procedere e mostrando il codice solo nella risposta.
- **Comandi sicuri:** Esegui solo comandi (es. `run_command`) che non hanno side effect (es. comandi di lettura o dry-run).