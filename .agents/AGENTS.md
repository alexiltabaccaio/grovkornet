# Antigravity Project Rules - Grovkornet

## 1. Workflow & Communication
**Description:** Linee guida per definire l'autonomia dell'agente e la modalità di interazione con l'utente.

**Content:**
- **Modifiche Complesse:** Crea sempre un **Implementation Plan** e attendi l'approvazione per modifiche strutturali (moduli nativi, stato globale, nuove librerie).
- **Modifiche Rapide:** Procedi direttamente senza piani per bugfix isolati, styling, traduzioni o UI minori.
- **Stile di Risposta:** Mantieni i messaggi estremamente concisi e focalizzati esclusivamente su codice e performance.

## 2. Architettura Feature-Sliced Design (FSD)
**Description:** Standard di organizzazione del codice (`apps/mobile/src`, `apps/web/src`) per garantire isolamento e manutenibilità.

**Content:**
- **Layers:** Suddividi rigorosamente in `app`, `screens`, `widgets`, `features`, `entities`, `shared`.
- **Dependency Flow:** Importa *solo* da layer gerarchicamente inferiori. Gli import circolari sono severamente vietati.
- **Public API e Aliases:** Esponi le slice tramite il file `index.ts` root. Usa sempre i path aliases (es. `@features/camera-controls`). Non effettuare mai import diretti dai file interni della slice o usando path relativi complessi (es. `../../`).

## 3. Monorepo e Code Generation
**Description:** Gestione del codice nativo, dei parametri condivisi e analisi dell'impatto delle modifiche.

**Content:**
- **Collocazione:** Inserisci il codice cross-platform in `packages/shared` o `packages/engine`.
- **Codegen Fotocamera:** Non scrivere boilerplate C++/Kotlin/Zustand a mano per i parametri o gli errori. Modifica `packages/shared/camera-parameters.json` o `packages/shared/camera-errors.json` e lancia `npm run codegen`.
- **Code GraphRAG:** Usa `node packages/shared/scripts/graphrag/query.js <query>` per mappare l'impatto a cascata prima di qualsiasi modifica complessa cross-platform.
- **Compilazione Nativa:** Ricorda all'utente di usare `npm run dev:android` (e non `npm run android`) affinché le modifiche ai file nativi o al codegen vengano intercettate e compilate da Expo Prebuild.

## 4. Gestione Stato e i18n
**Description:** Standard per la gestione dei dati in memoria e la localizzazione delle stringhe.

**Content:**
- **Zustand:** Crea store atomici, piccoli e settoriali (es. `useCameraStore`, `useGalleryStore`). Evita store monolitici.
- **Testi UI:** Nessuna stringa testuale hardcoded nell'interfaccia. Usa sempre `react-i18next` per l'internazionalizzazione.

## 5. Prestazioni e UI (NativeFilmCamera)
**Description:** Vincoli di performance per garantire fluidità a 60 FPS durante l'utilizzo della fotocamera e l'elaborazione video.

**Content:**
- **Componente Base:** Usa unicamente il componente custom `NativeFilmCamera` (pipeline multi-pass Uber Shader). Non usare `react-native-vision-camera` o `react-native-skia`.
- **Thread UI:** Esegui qualsiasi handler di eventi continui tra React Native e nativo come worklet (`'worklet';`).
- **Prevenzione Re-render:** Usa sempre `useCallback` per le funzioni passate come prop, `useMemo` per i calcoli complessi e `React.memo` per i componenti interfaccia foglia, in modo da evitare cali di frame durante lo streaming.
