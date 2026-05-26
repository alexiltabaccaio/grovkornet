---
description: Analizza e verifica la validità dei test esistenti, allineandoli alle funzionalità correnti.
---
Verifica lo stato e la validità dei test esistenti seguendo questo flusso:

1. **Identifica e ispeziona i test nelle cartelle corrette del progetto**:
   - **Unit & Smoke Tests (React Native)**: Collocati direttamente all'interno di `apps/mobile/src` a fianco dei componenti correlati (file con estensione `*.unit.test.ts(x)` e `*.smoke.test.ts(x)`).
   - **Integration Tests (React Native)**: Situati in `apps/mobile/test/integration` (file `*.integration.test.ts(x)`).
   - **Kotlin Unit Tests (Android)**: Situati in `packages/engine/android/src/test/java`.
   - **C++ Unit Tests (Native Engine)**: Situati in `packages/engine/android/src/test/cpp`.
   - **Android Instrumentation Tests (Android)**: Situati in `packages/engine/android/src/androidTest`.
2. **Controlla l'allineamento dei test**:
   - Verifica che le funzionalità recenti abbiano test unitari associati.
   - Controlla se ci sono test obsoleti o con nomi che non rispettano le convenzioni (`*.unit.test.*`, `*.smoke.test.*`, `*.integration.test.*`).
3. **Esegui i test localmente** per assicurarti che non ci siano regressioni o suite fallite causate da modifiche recenti al codice o alle interfacce.
