---
description: Attiva l'uso del sistema GraphRAG interno per interrogare le dipendenze e mappare la struttura del codice prima di interventi complessi.
---

- Individua la richiesta dell'utente relativa alla mappatura o all'architettura.
- Esegui il comando di query del GraphRAG: `node packages/shared/scripts/graphrag/query.js "<tua_query>"`.
- Analizza i risultati per comprendere dipendenze, flussi incrociati o layer FSD.
- Presenta un report all'utente con le scoperte e come queste influenzano la modifica proposta.