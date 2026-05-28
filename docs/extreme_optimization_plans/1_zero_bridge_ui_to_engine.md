# 1. Zero-Bridge UI-to-Engine (Direct JSI Binding)

## Problema Attuale
I controlli dell'interfaccia (come lo scorrimento di uno slider per la grana) attraversano svariati layer: `React/Reanimated (Worklet) -> Zustand -> JS Thread -> Expo Module API -> Kotlin -> JNI -> C++ (RenderParams)`. Pur essendo un passaggio veloce, l'uso del bridge e dell'API di Expo introduce un minuscolo overhead e latenza.

## La Soluzione Estrema
Creare un modulo **JSI (JavaScript Interface)** nativo interamente scritto in C++. Il JSI permette a JavaScript (e ai Worklets di Reanimated in esecuzione sulla UI Thread) di chiamare funzioni C++ in modo diretto e sincrono, eludendo del tutto il Bridge di React Native e lo strato Java/Kotlin.

In uno scenario ideale, si espone il puntatore di memoria della struct C++ `RenderParams` direttamente a Reanimated. Quando l'utente muove lo slider a 60FPS, il Worklet scrive i valori *direttamente nella RAM nativa*.

- **Vantaggi:** Latenza di input touch-to-engine ridotta matematicamente a `0 ms`.
