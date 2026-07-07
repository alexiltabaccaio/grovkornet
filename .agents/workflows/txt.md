---
description: Crea un file di testo contenente tutto il codice sorgente utile del progetto. È pensato per creare backup agili o per fornire contesto testuale esteso a LLM esterni.
---

- Lancia lo script Node predisposto nel monorepo: `node scripts/bundle-source.js` (o l'equivalente per raggruppare i file).
- Attendi che lo script completi la generazione del file `grovkornet_source_bundle.txt` nella root del progetto.
- Avvisa l'utente al termine dell'operazione, mostrando un riepilogo con: numero totale dei file inclusi, dimensione del file `.txt` e conferma del percorso di salvataggio.