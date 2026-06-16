# 4. Uniform Buffer Objects (UBO) e Backend Vulkan

Questo documento analizza il piano teorico e raccoglie il registro dei tentativi di ottimizzazione estrema focalizzati sulla migrazione del backend di rendering a **Vulkan** e l'adozione di **AHardwareBuffer**, con i relativi ostacoli riscontrati. I tentativi sono stati momentaneamente sospesi a causa di un persistente problema di "Schermo Nero" (Black Screen) nonostante la risoluzione dei problemi di crash e sincronizzazione.

## Stato dell'Implementazione (Giugno 2026)
- **Simulazione UBO (Impacchettamento parametri):** **COMPLETATO**. Abbiamo riorganizzato i parametri dinamici del `CompositeShader` raggruppandoli in 7 vettori `float4` (`u_RenderData0` - `u_RenderData6`) anziché ~25 parametri float individuali. Questo ha ridotto le chiamate API `setParameter` in C++ da ~26 a sole 7 chiamate per frame (con una riduzione del ~73% dell'overhead della CPU).
- **Backend Vulkan e AHardwareBuffer nativi:** **Sospeso temporaneamente** (vedi dettagli sotto per il problema dello "Schermo Nero").

## La Soluzione Estrema (UBO & Vulkan)
L'ottimizzazione si divide in due fasi principali:
1. **Compattazione dei Parametri (Simulazione UBO):** *(Attiva ed implementata)*. Invece di eseguire molteplici chiamate JNI/C++ individuali per aggiornare singoli parametri (grana, bloom, esposizione, ecc.), il codice C++ impacchetta la struct in un set limitato di vettori `float4`. Le macro dello shader espandono nuovamente i nomi originari, mantenendo intatta la compatibilità del codice GLSL e degli shader inclusi, riducendo drasticamente il bottleneck sul render thread.
2. **Backend Vulkan Hardware Nativo:** Forzare l'uso del backend **Vulkan** per Filament e usare un UBO hardware nativo accoppiato ad `AHardwareBuffer` per azzerare l'overhead dell'ISP/GPU.

- **Vantaggi del UBO Simulato:** Riduzione immediata del thermal throttling della CPU durante lo streaming video continuo, garantendo frame-rate sincronizzati ed evitando micro-scatti (jank) al cambio preset.
- **Vantaggi del Backend Vulkan:** Spostamento totale della gestione memoria a basso livello, permettendo al SoC di riscaldare meno e risparmiare ulteriore batteria.

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
