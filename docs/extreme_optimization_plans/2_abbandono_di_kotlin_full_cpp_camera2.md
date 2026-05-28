# 2. Abbandono di Kotlin: Full C++ Camera2 (NDK)

## Problema Attuale
Attualmente Kotlin orchestra il ciclo di vita dell'API fotocamera (`CameraEngine.kt`) e mappa i frame in un `SurfaceTexture` o `AHardwareBuffer` per il motore C++.

## La Soluzione Estrema
Rimuovere Java/Kotlin dalla gestione della fotocamera. Utilizzare **ACameraManager (NDK Camera2)** direttamente nel core engine C++ (`GrovkornetEngine.cpp`).

Il flusso di dati del sensore ottico viene incanalato e mappato in VRAM dalla GPU senza mai interagire con l'ambiente managed di Android. In aggiunta, la sincronizzazione del rendering si sposta da `Choreographer` in Kotlin ad `AChoreographer` in C++, permettendo l'implementazione di algoritmi di **Frame Pacing e VSync Prediction** (tipici dei motori grafici AAA) per allineare l'estrazione dei frame dal sensore al refresh rate esatto del display hardware, sopprimendo definitivamente i micro-stutter.

- **Vantaggi:** Zero-Copy assoluto hardware, frame-pacing perfetto, latenza visiva abbattuta.
