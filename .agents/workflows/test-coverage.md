---
description: Verifica e raccoglie i dati di coverage dei test per tutte le suite del monorepo per calcolare la percentuale attuale.
---

- Esegui i comandi di test con i flag per il coverage per tutti i package (TypeScript, Kotlin, C++, Codegen).
- Raccogli i file di report di coverage generati (es. all'interno delle cartelle `/coverage` o parsando l'output del terminale).
- Analizza i dati e mostra all'utente la percentuale di copertura per i vari strati, segnalando eventuali cali di copertura significativi o aree critiche scoperte.