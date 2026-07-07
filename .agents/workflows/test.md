---
description: Esegue tutte le suite di unit test del monorepo per validare il codice cross-platform e i componenti nativi senza lanciare i test e2e.
---

Esegui in sequenza i seguenti comandi dalla cartella root:
- **Codegen:** `npm test -w @grovkornet/shared`
- **TypeScript/Mobile:** `npm run test -w @grovkornet/mobile`
- **Kotlin/Engine:** `npm run test -w @grovkornet/engine`
- **C++/Engine:** `npm run test:cpp -w @grovkornet/engine` (o `node packages/engine/scripts/run-cpp-tests.js`)

Al termine, riassumi i risultati finali per ciascuna suite, evidenziando successi o eventuali errori individuati.