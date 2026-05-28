# 4. Uniform Buffer Objects (UBO) e Backend Vulkan

Questo documento analizza il piano teorico e raccoglie il registro dei tentativi di ottimizzazione estrema focalizzati sulla migrazione del backend di rendering a **Vulkan** e l'adozione di **AHardwareBuffer**, con i relativi ostacoli riscontrati. I tentativi sono stati momentaneamente sospesi a causa di un persistente problema di "Schermo Nero" (Black Screen) nonostante la risoluzione dei problemi di crash e sincronizzazione.

## Problema Attuale
L'engine aggiorna i parametri uno ad uno (es. tramite le chiamate seriali `setParameter("u_Exposure", ...)` nel materiale Filament). Se il backend in uso è OpenGL ES, questo genera un certo overhead sulla CPU per la traduzione dei comandi da parte dei driver grafici.

## La Soluzione Estrema
Forzare l'uso del backend **Vulkan** per Filament e impacchettare tutte le variabili dello shader in un singolo **Uniform Buffer Object (UBO)** (un blocco di memoria contigua). Invece di eseguire molteplici chiamate per aggiornare singoli parametri (grana, bloom, esposizione, ecc.), il codice C++ copia in memoria l'intero blocco struct con un singolo *memory push* verso la GPU.

- **Vantaggi:** Poiché Vulkan è un'API di basso livello pensata per il multithreading, questo approccio rimuove il bottleneck imposto dal driver grafico. La CPU si alleggerisce ("dorme" più a lungo), con conseguente **riduzione netta del calore generato dal SoC**. Insieme all'ottimizzazione del vetro (punto 3), rappresenta la panacea per i surriscaldamenti.

---

## Dettagli Tecnici ed Obiettivo Iniziale
Vulkan richiede che i flussi video esterni (`filament::Stream`) siano alimentati direttamente tramite `AHardwareBuffer` anziché `SurfaceTexture` (che è strettamente legato a OpenGL ES). L'obiettivo era ottenere l'accesso diretto ai buffer hardware della fotocamera e passarli al motore Filament per azzerare l'overhead del driver grafico.

---

## Cronologia dei Tentativi di Implementazione

### 1. Migrazione a `ImageFormat.PRIVATE` e `AHardwareBuffer`
- **Azione:** Sostituzione di `ImageFormat.YUV_420_888` con `ImageFormat.PRIVATE` nel `ImageReader` di `CameraSessionManager`. Questo formato restituisce buffer hardware nativi opachi (`HardwareBuffer`), ideali per il campionamento diretto da parte della GPU (`SAMPLER_EXTERNAL`) senza copie lato CPU.
- **Risultato:** Implementato con successo a livello di architettura, ma ha scatenato problemi di concorrenza con la pipeline di rendering di Filament.

### 2. Risoluzione del Deadlock e Starvation (Eccezione `maxImages`)
- **Problema:** L'app crashava fatalmente con l'errore:
  `java.lang.IllegalStateException: maxImages (3) has already been acquired, call #close before acquiring more.`
  La pipeline di rendering di Filament (Vulkan swapchain) trattiene intrinsecamente fino a 3 frame simultaneamente prima di rilasciarli. Con un `ImageReader` limitato a 3 frame, si creava una condizione di starvation: CameraX tentava di acquisire il 4° frame, ma la GPU non aveva ancora rilasciato il 1°.
- **Azione:**
  1. Implementazione di un contatore atomico (`std::atomic<int> releasedFrameCount`) nel core C++ (`GrovkornetEngine`), incrementato tramite callback quando Filament invoca `setAcquiredImage`.
  2. Creazione di una coda concorrente (`pendingCloses`) in Kotlin (`FilmRenderThread`) associata a un polling via `Handler.postDelayed`. I frame vengono chiusi (`image.close()`) **solo e unicamente** quando il motore C++ notifica l'avvenuto rilascio.
  3. Aumento di `maxImages` a 5 e introduzione di un blocco `try-catch` su `acquireLatestImage()` per "droppare" i frame in eccesso senza far crashare l'app.
- **Risultato:** **Successo parziale**. I crash sono completamente scomparsi. I log hanno confermato la perfetta ricezione e sincronizzazione di 60 FPS continui senza rallentamenti o leak di memoria.

### 3. Il Mistero dello "Schermo Nero"
- **Problema:** Nonostante l'app fosse fluida e reattiva, e i frame venissero correttamente elaborati dal render thread, l'output visivo sullo schermo rimaneva **completamente nero** (screenshot di 64KB invece dei normali 1.8MB).
- **Tentativo A (TextureSampler WrapMode):**
  Su Vulkan, il campionamento di texture YUV/OES esterne (`SAMPLER_EXTERNAL`) fallisce silenziosamente se il Wrap Mode non è impostato esplicitamente su `CLAMP_TO_EDGE`.
  *Azione:* Abbiamo forzato `filament::TextureSampler::WrapMode::CLAMP_TO_EDGE` su tutti e 3 gli assi (S, T, R) nel material setup in `FrameRenderer.cpp`.
  *Esito:* Lo schermo è rimasto nero.
- **Tentativo B (HardwareBuffer Usage Flags):**
  Si sospettava che l'override manuale dei flag di utilizzo (`HardwareBuffer.USAGE_GPU_SAMPLED_IMAGE`) durante l'istanza dell' `ImageReader` stesse inibendo i permessi di scrittura da parte del driver della fotocamera (ISP), restituendo buffer fisicamente vuoti (pixel a 0).
  *Azione:* Rimozione totale del flag di `usage` custom, per permettere ad Android di dedurre automaticamente la combinazione ottimale di lettura GPU e scrittura fotocamera.
  *Esito:* Nessun cambiamento, schermo ancora nero.

---

## Conclusione e Sospensione
Tutti i componenti logici (concorrenza, passaggio JNI, memory management) funzionavano in modo robusto. Tuttavia, l'assenza di output visibile suggerisce un problema silente a basso livello:
1. Incompatibilità intrinseca tra `ImageFormat.PRIVATE`, `CameraX` e il backend Vulkan specifico di Filament su alcuni driver hardware.
2. Un potenziale fallimento silente nell'allocazione dell' `AHardwareBuffer` come External Stream.

Il contesto è stato resettato per mantenere lo storico pulito. Qualsiasi implementazione futura del backend Vulkan o degli UBO dovrà ripartire da questa documentazione per non ripetere i medesimi errori di binding hardware.
