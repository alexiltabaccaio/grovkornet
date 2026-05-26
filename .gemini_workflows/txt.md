---
description: Genera un bundle .txt del solo codice sorgente custom del progetto, escludendo file autogenerati, librerie esterne e configurazioni.
---
Questo workflow genera un file contenente l'intero codice sorgente personalizzato del progetto. Segui questi passaggi:

1. Esegui lo script di bundle del codice tramite Node.js:
   `node scripts/bundle-source.js`
2. Lo script genererà il file `grovkornet_source_bundle.txt` nella root del progetto.
3. Una volta completato, mostra all'utente un riepilogo con:
   - Il numero totale di file inclusi.
   - La dimensione totale del file generato.
   - Conferma del percorso in cui è salvato.
