# Specifica Tecnica e Roadmap di Implementazione - Grovkornet v1.0

<!-- COMMENTO DI CONTROLLO STATO SVILUPPO -->
> ### ⚠️ NOTA DI DIRETTIVA PER L'AGENTE LLM
> **OBBLIGATORIO:** Prima di iniziare qualsiasi sessione di sviluppo, analizza questo file per verificare lo stato di avanzamento del progetto. Ogni volta che completi un'implementazione, un fix o un refactoring descritto in uno dei punti sottostanti, **devi tassativamente aggiornare questo documento** modificando il relativo checkbox da `- [ ]` a `- [x]`. Non procedere oltre se i passaggi precedenti non sono stati consolidati e testati con la suite di test integrata.

---

## ~~[TICKET #01] – Fix Geometria Sensore (Risoluzione "Falso Zoom")~~ [COMPLETATO]
* **Contesto Finale:** Chi in passato ha provato a risolvere il "Falso Zoom" aveva tentato di usare un comando hardware nativo (`SCALER_CROP_REGION`). Questo approccio era "Architetturalmente invalido" perché molti driver Android ritagliano la zona centrale del sensore per forzare il 16:9, generando uno zoom digitale estremo e distruggendo il Field of View. La soluzione definitiva è consistita nel forzare fisicamente il modulo `CameraSessionManager.kt` a streammare sempre l'immagine grezza nativa `4:3` (evitando alla radice il riavvio hardware e scavalcando i driver fallati dell'ISP) e nell'eseguire il crop chirurgico esclusivamente via software tramite gli shader OpenGL nel mirino e `ImageUtils.cropToAspectRatio` durante lo scatto.
* **Stato Avanzamento:**
    - [x] Rimuovere la dipendenza del trigger di riavvio hardware dal parametro `aspectRatio` in `CameraEngine.kt`.
    - [x] Modificare `CameraSessionManager.kt` per richiedere sempre l'output nativo 4:3 tramite `ResolutionSelector`.
    - [x] Verificare che il cropping via software (`LiveFilmProcessor` e `ImageUtils`) mantenga intatto il Field of View.

---

## ~~[TICKET #02] – Sicurezza Commerciale: Oscuramento Catture (FLAG_SECURE)~~ [COMPLETATO]
* **File di riferimento:** Store Zustand (`useSystemStore` / `useFilmStore`), modulo di cattura nativo.
* **Contesto:** L'app permette il libero utilizzo dei sub-parametri Pro (es. OKLAB boundaries, granularità fine) nell'anteprima in tempo reale, bloccando lo scatto definitivo. Al momento manca una protezione hardware che impedisca agli utenti di esfiltrare l'immagine elaborata eseguendo uno screenshot o una registrazione video del mirino.
* **Stato Avanzamento:**
    - [x] (Sostituito con Native SurfaceView) Integrare la libreria `expo-screen-capture` per comunicare in modo asincrono con la Window nativa di Android.
    - [x] (Sostituito con Native SurfaceView) Creare un listener reattivo collegato allo store Zustand che ascolti lo stato booleano `isProFeatureActive`.
    - [x] Invocare la funzione nativa che applica il flag hardware di sicurezza (`SurfaceView.setSecure(true)`).
    - [x] Forzare l'**oscuramento totale (schermo nero)** del feed video sia in caso di screenshot sia in caso di avvio di software di registrazione dello schermo (ad esclusione di `isDebugEnabled == true`).

---

## [TICKET #03] – Ottimizzazione Galleria e Mitigazione Rischi OOM
* **File di riferimento:** `GalleryStrip.tsx`, `PhotoPreview.tsx`, hook di recupero asset.
* **Contesto:** Lo scroll della galleria custom causa micro-scatti e crash per OutOfMemory (OOM). Questo accade perché il componente `<Image>` standard di React Native decodifica in memoria RAM i file originali ad alta risoluzione presi dal disco senza eseguire downsampling.
* **Stato Avanzamento:**
    - [ ] Deprecare l'uso del tag `<Image>` standard di React Native in tutta la feature della galleria.
    - [ ] Implementare il componente `Image` di `expo-image`.
    - [ ] Bloccare la dimensione massima di decodifica hardware a livello di pixel nel componente `GalleryStrip.tsx` (es. `width: 56, height: 56`) utilizzando la proprietà `contentFit="cover"`.
    - [ ] Nel visualizzatore principale `PhotoPreview.tsx`, implementare la proprietà `placeholder` iniettando la miniatura sgranata già presente in RAM con transizione nativa per il cross-fade per eliminare i tempi vuoti di I/O da disco:
      ```tsx
      transition={200}
      ```

---

## [TICKET #04] – Rafforzamento Watermark Anti-Intrusione
* **File di riferimento:** `WatermarkEngine.h` / `WatermarkEngine.cpp`
* **Contesto:** La firma modulata sui coefficienti DCT a media frequenza fallisce la decodifica sulle immagini molto elaborate. L'alto livello di entropia e rumore ad alta frequenza generato dalla grana spessa (core feature di Grovkornet) e dalle forti curve di contrasto viene interpretato dall'encoder JPEG in uscita come rumore da piallare, distruggendo il watermark sotto la soglia di tolleranza.
* **Stato Avanzamento:**
    - [ ] Aprire `WatermarkEngine.h` e individuare le costanti di inserimento e rilevamento.
    - [ ] Aggiornare la costante `ALPHA` a `24.0` per forzare la profondità del segnale nella matrice DCT (precedente: 12.0).
    - [ ] Ridurre la costante `MATCH_THRESHOLD` a `46` per abbassare la soglia minima di tolleranza dei blocchi (precedente: 54).

---

## [TICKET #05] – Pipeline Anteprima (Double-Pass Thumbnail) e Gestione Occlusione
* **File di riferimento:** `CapturePipeline.kt`, `LiveFilmProcessor.cpp`, componenti UI di viewport.
* **Stato Avanzamento:**
    - [ ] **Double-Pass Thumbnail:** Intercettare immediatamente il frame buffer corrente elaborato a 60 FPS dalla GPU tramite `LiveFilmProcessor` al trigger di scatto. Scalarlo a bassa risoluzione (~256px) e inviarlo istantaneamente alla UI (`latestPreviewUri`).
    - [ ] **Double-Pass Thumbnail:** Configurare l'`OffscreenFilmProcessor` affinché scambi l'URI nel `MediaStore` in background in modo silenzioso solo a salvataggio finale completato.
    - [ ] **Drag del Segnale Video:** Avvolgere il container della preview video in un `PanGestureHandler` (Reanimated).
    - [ ] **Drag del Segnale Video:** Consentire lo spostamento del frame esclusivamente verso l'alto (asse Y) e solo se lo stato della Bottom Sheet è "Aperta". Gestire la chiusura con una `withSpring` animation per riportare il frame a posizione 0 sul thread UI.

---

## [TICKET #06] – Architettura Preset: Scratchpad e Viral Loop per Instagram
* **File di riferimento:** `Header` widget, `useFilmStore.ts`, router di deep linking.
* **Stato Avanzamento:**
    - [ ] **Gestione Scratchpad:** Implementare l'oggetto di bozza temporaneo (`customDraft`) nello store Zustand, facendolo scattare al variare di un singolo cursore rispetto ai default.
    - [ ] **Gestione Scratchpad:** Assicurarsi che il `customDraft` rimanga in memoria in background durante i cambi rapidi di preset per la modalità comparativa, senza azzerarsi.
    - [ ] **Esportazione Badge:** Configurare il rendering condizionale off-screen del PNG dello sticker: se il preset ha un nome mostra **logo bianco + nome stile**; se è `customDraft` (anonimo) mostra **esclusivamente il logo bianco**.
    - [ ] **Deep Linking:** Configurare il parsing dell'Universal Link per estrarre il payload JSON dal database e idratare all'istante lo store Zustand e i controlli Filament C++.

---

## [TICKET #07] – Verifica Rinegoziazione Risoluzione Anteprima (1080p vs 4K)
* **File di riferimento:** `CameraControlManager.kt`, JNI Bridge, inizializzazione del `filament::Stream`.
* **Contesto:** Si rileva un drop di framerate anomalo quando si attiva la preview 4K. Il sospetto tecnico è che, quando l'impostazione "4K Preview" è disattivata (OFF), la pipeline continui in realtà a richiedere un buffer ad altissima risoluzione alla fotocamera, costringendo la GPU a un downscaling continuo verso il mirino.
* **Stato Avanzamento:**
    - [ ] Ispezionare la logica di allocazione dei `Surface` all'interno della `StreamConfigurationMap`.
    - [ ] Imporre che al cambio di stato del toggle "4K Preview -> OFF", la sessione della fotocamera venga ricreata distruggendo il vecchio stream e applicando un ridimensionamento fisico rigido del buffer a **1920x1080** pixel direttamente alla sorgente hardware.

---

## [TICKET #08] – Refactoring Gerarchia UI: Controlli Bloom e Inversione Sliders
* **File di riferimento:** Pannello dei controlli, moduli della Bottom Sheet dei parametri.
* **Stato Avanzamento:**
    - [ ] **Sfoltimento Bloom:** Isolare 1 solo parametro principale (es. *Intensità Bloom*) da mantenere accessibile direttamente nella barra dei controlli standard.
    - [ ] **Sfoltimento Bloom:** Spostare gli altri 3 parametri secondari del Bloom all'interno della sezione avanzata dei sub-parametri nella Bottom Sheet Pro.
    - [ ] **Inversione Sliders Colore:** Riorganizzare l'ordine verticale del pannello controlli posizionando lo **Slider Colore** (tinte) nella parte superiore e lo slider della **Saturazione Selettiva** immediatamente sotto di esso.

---

## ~~[TICKET #09] – Persistenza di Stato della Torcia (Flash Session Handling)~~ [COMPLETATO]
* **File di riferimento:** `CameraControlManager.kt`, `useSystemStore.ts`
* **Contesto:** Quando l'utente ha la torcia attiva e modifica la risoluzione dell'app, la torcia si spegne definitivamente perché la distruzione e successiva ricostruzione della `CameraCaptureSession` resetta lo stato dei parametri dell'ISP.
* **Stato Avanzamento:**
    - [x] Mantenere il flag booleano di stato `isTorchOn` persistente all'interno dello store globale Zustand durante le operazioni di teardown della fotocamera.
    - [x] Impedire il reset forzato dei parametri di configurazione nel ciclo di vita Kotlin se è in corso un cambio di risoluzione guidato dall'app.
    - [x] Leggere il flag `isTorchOn` nel momento esatto in cui viene istanziata la nuova `CameraCaptureSession` e riapplicare immediatamente l'istruzione hardware:
       ```kotlin
       captureRequestBuilder.set(CaptureRequest.FLASH_MODE, CaptureRequest.FLASH_MODE_TORCH)
       ```
    - [x] Forzare la riesecuzione della richiesta di cattura continua (`setRepeatingRequest`) per ridurre al minimo il flicker visivo.

---

## [TICKET #10] – Inline Editing del Nome Preset e Fallback Logico
* **File di riferimento:** `Header.tsx`, `useFilmStore.ts`
* **Stato Avanzamento:**
    - [ ] Configurare il testo del nome nell'header invisibile in modo che, al tap, si trasformi in un elemento `TextInput` attivo invocando la tastiera.
    - [ ] Vincolare la tastiera nativa in modalità Dark tramite la prop `keyboardAppearance="dark"`.
    - [ ] Implementare il controllo al blur/submit: se la stringa è vuota o contiene solo spazi, resettare lo stato dello store Zustand forzando il ritorno automatico allo status "Personalizzato" (`customDraft`), nascondendo le frecce.

---

## [TICKET #11] – Interazione Avanzata: Animazione "Hold-to-Reset" Settoriale
* **File di riferimento:** Pannello controlli, `useFilmStore.ts`, componenti di sezione.
* **Stato Avanzamento:**
    - [ ] Avvolgere i pulsanti di ciascuna macro-sezione (e il pulsante generale delle Impostazioni) in un `LongPressGestureHandler` di Reanimated.
    - [ ] Avviare un'animazione di riempimento colore di background (progress bar da 0% a 100% della larghezza) alla pressione prolungata, dopo un micro-ritardo iniziale.
    - [ ] Configurare il rilascio: se interrotto prima del 100%, far rimbalzare l'animazione a 0% tramite `withSpring` senza mutare i dati.
    - [ ] Configurare il trigger al 100%: dopo una micro-pausa statica finale, far scattare la funzione Zustand che clona i parametri memorizzati nel profilo "Preferito" (ripristinando la singola sezione o l'intera app a seconda del bersaglio).

---

## [TICKET #12] – Architettura Footer: Modulo "Preset Manager" e Preferiti
* **File di riferimento:** `Footer.tsx`, Pannello di configurazione avanzata, `useFilmStore.ts`
* **Stato Avanzamento:**
    - [ ] Integrare all'interno delle opzioni del footer il pannello amministrativo "Preset Manager" con una lista dedicata.
    - [ ] Aggiungere un'icona "X" di fianco a ciascun preset utente per consentirne la cancellazione permanente in locale dal database.
    - [ ] Implementare un sistema di toggle per definire quali preset includere nel carosello dell'header per lo scorrimento rapido e quali mantenere esclusivi nel footer.
    - [ ] Implementare la marcatura di un profilo come "Preferito" globale, impostando il preset standard "Base" (all'estrema sinistra) come preferito iniziale di sistema.
