# Grovkornet: Architettura di Ottimizzazione Estrema (Livello Superstar)

Questo documento teorico esplora le ottimizzazioni architetturali estreme applicabili al progetto per spingere al limite assoluto le performance, la latenza e il consumo energetico (controllo della temperatura). 
Sebbene l'app segua già le *best practices* per l'ecosistema React Native + C++ (Uber Shader single-pass, React.memo, Worklets su UI thread, zero-copy HardwareBuffer), le seguenti soluzioni mirano ad abbattere i limiti strutturali del framework e del sistema operativo stesso.

---

## 1. Zero-Bridge UI-to-Engine (Direct JSI Binding)

**Problema Attuale:** 
I controlli dell'interfaccia (come lo scorrimento di uno slider per la grana) attraversano svariati layer: `React/Reanimated (Worklet) -> Zustand -> JS Thread -> Expo Module API -> Kotlin -> JNI -> C++ (RenderParams)`. Pur essendo un passaggio veloce, l'uso del bridge e dell'API di Expo introduce un minuscolo overhead e latenza.

**La Soluzione Estrema:**
Creare un modulo **JSI (JavaScript Interface)** nativo interamente scritto in C++. Il JSI permette a JavaScript (e ai Worklets di Reanimated in esecuzione sulla UI Thread) di chiamare funzioni C++ in modo diretto e sincrono, eludendo del tutto il Bridge di React Native e lo strato Java/Kotlin.
In uno scenario ideale, si espone il puntatore di memoria della struct C++ `RenderParams` direttamente a Reanimated. Quando l'utente muove lo slider a 60FPS, il Worklet scrive i valori *direttamente nella RAM nativa*.
- **Vantaggi:** Latenza di input touch-to-engine ridotta matematicamente a `0 ms`.

---

## 2. Abbandono di Kotlin: Full C++ Camera2 (NDK)

**Problema Attuale:** 
Attualmente Kotlin orchestra il ciclo di vita dell'API fotocamera (`CameraEngine.kt`) e mappa i frame in un `SurfaceTexture` o `AHardwareBuffer` per il motore C++.

**La Soluzione Estrema:**
Rimuovere Java/Kotlin dalla gestione della fotocamera. Utilizzare **ACameraManager (NDK Camera2)** direttamente nel core engine C++ (`GrovkornetEngine.cpp`). 
Il flusso di dati del sensore ottico viene incanalato e mappato in VRAM dalla GPU senza mai interagire con l'ambiente managed di Android. In aggiunta, la sincronizzazione del rendering si sposta da `Choreographer` in Kotlin ad `AChoreographer` in C++, permettendo l'implementazione di algoritmi di **Frame Pacing e VSync Prediction** (tipici dei motori grafici AAA) per allineare l'estrazione dei frame dal sensore al refresh rate esatto del display hardware, sopprimendo definitivamente i micro-stutter.
- **Vantaggi:** Zero-Copy assoluto hardware, frame-pacing perfetto, latenza visiva abbattuta.

---

## 3. UI 3D Unificata (Glassmorphism in C++)

**Problema Attuale:** 
L'interfaccia React Native del `ControlPanel` utilizza un componente `BlurView`. Su Android, questo si traduce in un `RenderEffect` applicato dal compositor del sistema operativo (SurfaceFlinger). Il sistema operativo deve leggere l'intero rendering della fotocamera, calcolare la sfocatura fullscreen e disegnarci sopra l'interfaccia. Questo meccanismo di "Overdraw" (pixel calcolati e sovrascritti più volte) fa impennare l'utilizzo della banda passante GPU e della RAM, generando molto calore.

**La Soluzione Estrema:**
Eliminare il Blur nativo di React Native. La UI in JavaScript diventa invisibile (composta solo da hitbox trasparenti per catturare i touch). 
Il **BlurView viene generato internamente da Filament (C++)** come livello finale dell'Uber Shader fotocamera, calcolando matematicamente un materiale "Frosted Glass" (es. passata di downsample e upsample blur mirata solo sull'area del pannello) in un singolo passo. 
- **Vantaggi:** Questo azzera l'Overdraw del sistema operativo. È l'ottimizzazione che garantirebbe **il più grande abbattimento in assoluto della temperatura** e del consumo della batteria, perché si rimuove un intero ciclo di lettura/scrittura full-screen ad ogni frame.

---

## 4. Uniform Buffer Objects (UBO) e Backend Vulkan

**Problema Attuale:** 
L'engine aggiorna i parametri uno ad uno (es. tramite le chiamate seriali `setParameter("u_Exposure", ...)` nel materiale Filament). Se il backend in uso è OpenGL ES, questo genera un certo overhead sulla CPU per la traduzione dei comandi da parte dei driver grafici.

**La Soluzione Estrema:**
Forzare l'uso del backend **Vulkan** per Filament e impacchettare tutte le variabili dello shader in un singolo **Uniform Buffer Object (UBO)** (un blocco di memoria contigua). Invece di eseguire molteplici chiamate per aggiornare singoli parametri (grana, bloom, esposizione, ecc.), il codice C++ copia in memoria l'intero blocco struct con un singolo *memory push* verso la GPU.
- **Vantaggi:** Poiché Vulkan è un'API di basso livello pensata per il multithreading, questo approccio rimuove il bottleneck imposto dal driver grafico. La CPU si alleggerisce ("dorme" più a lungo), con conseguente **riduzione netta del calore generato dal SoC**. Insieme al Punto 3, rappresenta la panacea per i surriscaldamenti.
