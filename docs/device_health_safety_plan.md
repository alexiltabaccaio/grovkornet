# Piano di Implementazione: Gestione Sicurezza Dispositivi e Avvisi Utente (Device Health)

L'obiettivo è introdurre un sistema di monitoraggio della salute del dispositivo (surriscaldamento e memoria limitata) per dispositivi meno recenti. Invece di disattivare silenziosamente le funzionalità causando confusione, implementeremo un sistema di avviso visivo che informa l'utente e riduce dinamicamente il carico di elaborazione (FPS).

---

## User Review Required

> [!IMPORTANT]
> - **Priorità Assoluta della Sicurezza**: Il tetto termico del sistema ha sempre la priorità assoluta sulle preferenze dell'utente (`effectiveFps = Math.min(userFpsSetting, thermalLimit)`).
> - **Allarme Obsoleto**: Se l'utente decide manualmente di impostare gli FPS ad un livello pari o inferiore al limite termico di sicurezza corrente (es. passa manualmente da 60 a 30 FPS sotto allarme di max 30 FPS), la restrizione non è più considerata attiva. Di conseguenza, il banner di allarme viene nascosto per evitare avvisi ridondanti.
> - **Frequenza di Esecuzione dei Test**: Verrà eseguita la suite di test specifica dopo il completamento di ciascuno step per garantire l'assenza di regressioni.

---

## Fasi di Sviluppo Passo-Passo

### Step 1: Modulo Nativo `DeviceHealthManager` e Unit Test Kotlin
1. **Creazione Modulo**: Creare il file nativo Kotlin `DeviceHealthManager.kt` in `packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/managers/`.
   - Ascolto dello stato termico tramite `PowerManager.addOnThermalStatusChangedListener` (API 29+).
   - Rilevamento memoria tramite `ActivityManager.isLowRamDevice()`.
   - Emissione degli eventi `onDeviceHealthUpdate` via ReactContext a JS.
   - Implementazione di `onCatalystInstanceDestroy()` per rimuovere il listener ed evitare memory leak nel contesto nativo.
2. **Creazione Test Nativo**: Scrivere `DeviceHealthManagerTest.kt` in `packages/engine/android/src/test/java/com/grovkornet/nativefilmcamera/managers/`.
   - Mockare `PowerManager` ed emulare cambiamenti di stato termico.
   - Verificare che l'evento venga inviato correttamente al contesto.
3. **Esecuzione Test**:
   ```bash
   ./gradlew :packages:engine:testDebugUnitTest --tests com.grovkornet.nativefilmcamera.managers.DeviceHealthManagerTest
   ```

---

### Step 2: Aggiornamento Zustand Store e Event Listener
1. **Modifica Tipi**: Aggiungere nello store `apps/mobile/src/entities/system/model/types.ts`:
   - Stato: `thermalState` (`'normal' | 'warning' | 'critical'`), `isLowRam` (boolean).
   - Azioni: `setThermalState`, `setIsLowRam`.
2. **Modifica Store**: Aggiornare `apps/mobile/src/entities/system/model/useSystemStore.ts` per includere i campi, i setter e impostare il listener all'evento nativo `onDeviceHealthUpdate`.
   - Garantire la rimozione dell'abbonamento (`.remove()`) nel cleanup per prevenire memory leak lato JS.
3. **Aggiornamento Test Store**: Modificare `apps/mobile/src/entities/system/model/useSystemStore.unit.test.ts` per testare i nuovi stati e verificare che il cleanup rimuova correttamente il listener.
4. **Esecuzione Test**:
   ```bash
   npx jest apps/mobile/src/entities/system/model/useSystemStore.unit.test.ts
   ```

---

### Step 3: Implementazione Watchdog per il Rilevamento Freeze (Kotlin)
1. **Thread di Rendering Nativo**: Modificare `FilmRenderThread.kt` per memorizzare l'ultimo frame ricevuto (`lastFrameReceivedTimeMs` tramite `@Volatile` o `AtomicLong`).
2. **Rilevamento Freeze**: Se non si ricevono frame per oltre 3000ms (mentre la preview è attiva e non vi sono cambi camera in corso), attivare la callback `onCameraFreezeDetected()` sul thread principale usando il `Looper.getMainLooper()`.
3. **Procedura di Ripristino**: In `CameraEngine.kt`, prima di eseguire il rebind dei usecase (`CameraSessionManager.bindCameraUseCases`):
   - Verificare `!capturePipeline.hasActiveCaptures()`.
   - Se c'è uno scatto in corso, rimandare di 1000ms usando un `Handler`.
   - Racchiudere il rebind in `try-catch` per catturare eventuali eccezioni ed evitare crash irreversibili (ANR).
4. **Esecuzione Test di Regressione Nativa**:
   ```bash
   ./gradlew :packages:engine:testDebugUnitTest
   ```

---

### Step 4: Calcolo FPS Effettivo e Integrazione nel Viewfinder
1. **Logica di Clamping (React Native)**: In `apps/mobile/src/widgets/viewfinder/ui/Viewfinder.tsx`:
   - Calcolare `effectiveFps` tramite la funzione:
     ```typescript
     const getEffectiveFps = (fpsSetting: number, thermalState: string): number => {
       if (thermalState === 'critical') return Math.min(fpsSetting, 15);
       if (thermalState === 'warning') return Math.min(fpsSetting, 30);
       return fpsSetting;
     };
     ```
   - Passare `targetFps={effectiveFps}` al componente nativo `NativeFilmCameraView` senza sovrascrivere o salvare il valore modificato in `usePreferencesStore.ts`.
2. **Aggiornamento Test Viewfinder**: Modificare `apps/mobile/src/widgets/viewfinder/ui/Viewfinder.unit.test.tsx` per verificare che gli FPS nativi si adeguino correttamente a 30 e 15 e che il database locale rimanga intatto.
3. **Esecuzione Test**:
   ```bash
   npx jest apps/mobile/src/widgets/viewfinder/ui/Viewfinder.unit.test.tsx
   ```

---

### Step 5: Banner di Avviso, Traduzioni i18n e Test UI
1. **Traduzioni**: Aggiornare `it.json` ed `en.json` in `apps/mobile/src/app/providers/i18n/locales/`:
   ```json
   "device_health": {
     "warning": "Surriscaldamento: Max 30 FPS",
     "critical": "Temp. Critica: Max 15 FPS"
   }
   ```
2. **Componente UI**: Creare `DeviceHealthWarningBanner.tsx` in `apps/mobile/src/widgets/viewfinder/ui/`.
   - Mostrare il banner solo se `isThermalThrottlingActive(fpsSetting, thermalState)` è `true`.
   - Nascondere se `fpsSetting <= limiteTermico` (Allarme Obsoleto).
3. **Unit Test UI**: Creare `DeviceHealthWarningBanner.unit.test.tsx` per validare la visibilità, il testo tradotto e il comportamento "obsoleto".
4. **Esecuzione Test**:
   ```bash
   npx jest apps/mobile/src/widgets/viewfinder/ui/DeviceHealthWarningBanner.unit.test.tsx
   ```

---

## Prevenzione Regressioni e Analisi dei Rischi

| Rischio | Impatto | Soluzione Preventiva |
| :--- | :--- | :--- |
| **Sovrascrittura Preferenze** | Alto | `effectiveFps` calcolato solo a runtime e passato come prop volatile, nessun salvataggio persistente. |
| **Race Condition Scatto / Rebind** | Critico | Verifica di `!capturePipeline.hasActiveCaptures()`, rinvio controllato del rebind se attivo. |
| **Crash del Watchdog** | Critico | Variabili `@Volatile` / `AtomicLong`, callback su `Looper.getMainLooper()`, e blocco `try-catch` protettivo. |
| **Memory Leak Eventi Nativi** | Medio | Disiscrizione esplicita in JS (`remove()`) e rimozione listener nativo in `onCatalystInstanceDestroy()`. |

---

## Verification Plan Finale

### Esecuzione Suite di Test Automatizzati Completa
Ad ogni step eseguito, o al termine dell'intero piano, lanceremo:
- **Test Kotlin**: `./gradlew :packages:engine:testDebugUnitTest`
- **Test Jest (TS/JS)**: `npm run test` (o specifico per i componenti modificati)

### Manual Verification
1. Simulare surriscaldamento da terminale: `adb shell cmd thermalservice override-status 3` (Warning) e `4` (Critical).
2. Verificare visivamente il banner e l'adeguamento degli FPS.
3. Testare il cambio di FPS manuale durante l'allarme e verificare che il banner scompaia quando gli FPS scendono sotto la soglia di sicurezza.
4. Verificare il watchdog introducendo un freeze di debug e controllando il riavvio della fotocamera dopo 3000ms.
