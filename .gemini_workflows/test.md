---
description: Esegue la suite completa di test (TypeScript, Kotlin, C++) escludendo i test end-to-end (e2e).
---
Esegui i test per i vari componenti del monorepo lanciando i seguenti comandi precisi dalla cartella root:

1. **Test TypeScript / React Native** (Unit & Smoke Tests dell'app mobile):
   Esegui:
   `npm run test -w @grovkornet/mobile`
2. **Test Kotlin (Android Native Module)** (Unit tests per il codice Kotlin di NativeFilmCamera):
   Esegui:
   `npm run test -w @grovkornet/engine`
3. **Test C++ (Native Rendering Engine)** (Unit tests per l'Uber Shader engine e pipeline rendering):
   Esegui:
   `npm run test:cpp -w @grovkornet/engine`
   *(Oppure esegui direttamente: `node packages/engine/scripts/run-cpp-tests.js`)*

Riassumi i risultati all'utente, specificando quali suite hanno superato i controlli e se ci sono stati errori.
