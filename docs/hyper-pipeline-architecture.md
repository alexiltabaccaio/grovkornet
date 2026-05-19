# Piano di Refactoring: Grovkornet Hyper-Pipeline

## Obiettivo
Migrare l'attuale architettura di rendering (basata su un singolo shader monolitico) verso una pipeline modulare ad altissime prestazioni. L'obiettivo è supportare decine di effetti simultanei a 60 FPS costanti, eliminando i colli di bottiglia termici e computazionali.

---

## Prerequisito Architetturale: Lo Spazio Colore Lineare
Tutta la matematica della luce (LUT, Halation, Compositing) dovrà avvenire in uno **Spazio Colore Lineare**. Il motore dovrà convertire i frame sRGB in ingresso in spazio Lineare, operare i calcoli, e riconvertire in sRGB (o Display P3) solo un istante prima dell'output. Sommare luce (es. Bloom) nello spazio sRGB crea aloni visivamente "sporchi" e innaturali.

---

## Fase 1: Setup dell'Astrazione Grafica (Google Filament)
L'attuale `OffscreenFilmProcessor` nativo verrà refattorizzato per utilizzare **Google Filament** come motore di rendering C++.
*   **Azione 1:** Integrare le librerie C++ di Filament nel progetto Android (JNI).
*   **Azione 2 (Zero-Copy):** Gestire i frame video (da Vision Camera) tramite **HardwareBuffers** (`AHardwareBuffer`). È fondamentale iniettare i frame nella memoria video della GPU senza *mai* copiare l'array di pixel nella memoria della CPU.
*   **Obiettivo:** Permettere al motore di scegliere automaticamente se renderizzare in Vulkan (dispositivi moderni) o eseguire un fallback silenzioso in OpenGL ES 3.0 (dispositivi legacy/driver buggati).

---

## Fase 2: Pilastro 1 - L'Inganno dell'Infinito (3D LUT Baking)
Estrazione di tutta la logica matematica legata al colore dal Fragment Shader per spostarla sulla CPU in background.
*   **Azione 1 (CPU):** Creare un thread asincrono che, al variare degli slider (Curve, Esposizione, Emulazioni pellicola), calcola una matrice di colori 33x33x33 e genera la Look-Up Table (LUT).
*   **Azione 2 (GPU):** Caricare la LUT in memoria video come Texture 3D.
*   **Azione 3 (Shader):** Svuotare il Fragment Shader principale da tutte le equazioni matematiche sui colori, sostituendole con una singola istruzione di interpolazione tridimensionale.
*   **Risultato Atteso:** Costo computazionale GPU azzerato per il color grading. Prestazioni fisse indipendentemente dal numero di manipolazioni cromatiche.

---

## Fase 3: Pilastro 2 - Il Render Graph Spaziale (Halation/Bloom)
Implementazione di un sistema multi-pass per gli effetti spaziali, necessario per abbattere l'enorme costo del Texture Fetching a piena risoluzione.
*   **Azione 1 (Downsampling):** Sfruttare le API di Filament per creare Framebuffer (FBO) a bassa risoluzione (es. 1/4 o 1/8 del frame originale).
*   **Azione 2 (Compute/Sfocatura):** Implementare l'algoritmo **Dual Kawase Blur** operando esclusivamente sulle miniature per isolare e sfocare le alte luci (Halation/Bloom).
*   **Azione 3 (Upsampling):** Ricomporre la miniatura sfocata, scalandola dolcemente sopra il frame originale ad alta risoluzione tramite additive blending.
*   **Risultato Atteso:** Effetti di luce cinematografici calcolati in frazioni di millisecondo senza intaccare la nitidezza dell'immagine base.

---

## Fase 4: Pilastro 3 - L'Uber-Shader Ottimizzato (Effetti Procedurali)
Sviluppo di un singolo shader finale per gli effetti screen-space, progettato per evitare lo stuttering su Mobile.
*   **Azione 1 (Uniform Branching):** Scrivere l'Uber-Shader finale che applica effetti procedurali (Grana, Vignettatura, VHS). Attivare/disattivare i blocchi di codice usando *esclusivamente* flag `uniform`. Vietare la JIT Compilation (generazione di stringhe C++ al volo) per evitare blocchi dell'interfaccia.
*   **Azione 2 (Texture Compositing):** Creare un sistema asincrono per fondere sequenzialmente molteplici texture (Polvere, Graffi) in un singolo livello "Overlay" in background.
*   **Azione 3 (Integrazione):** Passare all'Uber-Shader solo la texture Overlay risultante, aggirando il limite hardware delle texture simultanee (spesso max 16 su mobile vecchi).

---

## Fase 5: Sistemi di Sicurezza (Retrocompatibilità)
Implementazione dei salvavita termici e di memoria per i dispositivi con 4+ anni di vita.
*   **Azione 1 (DRS - Dynamic Resolution Scaling):** Implementare un misuratore basato sui Timestamp hardware della GPU (Frame Time). Se il tempo di rendering supera il 90% del budget a causa del surriscaldamento (Thermal Throttling), abbassare istantaneamente la risoluzione interna di elaborazione degli effetti (es. da 1080p a 720p).
*   **Azione 2 (Gestione OOM):** Assicurarsi che il Texture Compositing (Fase 4, Azione 2) avvenga in modo rigorosamente sequenziale (caricando e scaricando dalla RAM una singola texture alla volta) per evitare crash da Out of Memory su telefoni con soli 3GB/4GB di RAM.

