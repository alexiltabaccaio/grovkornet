# Grovkornet: Gerarchia degli Effetti e UX (Metafora Analogica)

Questa struttura definisce l'interfaccia utente, organizzata simulando fedelmente le componenti fisiche di un setup cinematografico. 

## UX Design Pattern (Modello a Bottom Sheet)
Il sistema è progettato per essere rapido da usare con una mano (run-and-gun), nascondendo la complessità ai principianti ma lasciandola accessibile ai professionisti.

1.  **Macro-Categoria (Tab):** Le sezioni fisiche principali (es. System, Lens, Body).
2.  **Modulo (Pill Menu):** Il sottomenù o famiglia di effetti (es. Esposizione, Texture).
3.  **Parametro "Hero" (Box Principale):** Il parametro più importante e usato (es. Intensità della Grana), immediatamente visibile come box slider a scorrimento verticale rapido.
4.  **Impostazioni Avanzate (Bottom Sheet Modale):** Accessibile tramite un Long Press, Doppio Tap o l'icona ingranaggio sul parametro Hero. Fa scivolare verso l'alto un pannello avanzato con le regolazioni di fino (es. Dimensione e Croma della grana), senza intasare lo spazio orizzontale della UI primaria.

## Pipeline di Rendering (L'Ordine del Segnale)
Per garantire il massimo realismo, l'Uber Shader (il cuore del motore grafico nativo) **deve** elaborare l'immagine e applicare i filtri seguendo il percorso fisico esatto che compirebbe la luce nella realtà (la tab SYSTEM è esclusa in quanto non fa parte del flusso ottico):
1.  **LENS:** Prima la luce attraversa il vetro, quindi si calcolano distorsioni, aberrazioni cromatiche e vignettature sui bordi dell'inquadratura originale.
2.  **BODY:** L'immagine ottica colpisce il sensore, dove avvengono le regolazioni elettroniche/meccaniche di esposizione, ISO e bilanciamento del bianco nativo.
3.  **FILM:** Il segnale grezzo "sviluppa" una pasta cromatica, subendo alterazioni di color grading (saturazione, contrasto, fade) e infine viene impressa la grana chimica/fisica della pellicola sulla pasta colore risultante.
4.  **DECK:** Il segnale già stampato e sviluppato subisce i danni del nastro magnetico (Jitter, Dropouts) e la distorsione finale dovuta allo schermo di riproduzione (CRT Scanlines, curvatura).

---

## 1. SYSTEM (Sistema)
*Impostazioni tecniche dell'applicazione, posizionate per prime a sinistra nell'interfaccia.*

### Preferenze
*   **Hero:** Lingua (Cambio lingua UI).
*   **Hero:** Debug (Attiva/Disattiva le statistiche on-screen per FPS, rendering, risoluzione).

---

## 2. LENS (L'Obiettivo)
*Tutto ciò che riguarda il vetro, la rifrazione della luce e l'ottica fisica prima che la luce tocchi il sensore.*

### Ottica (Optics)
*   **Hero:** Selezione Fotocamera (es. Grandangolo, Teleobiettivo).
*   **Hero:** Messa a Fuoco (Distanza). Include il toggle AF/MF.

### Difetti Ottici (Flaws)
*   **Hero:** Aberrazione Cromatica (Amount).
*   *(In programma)* **Vignettatura**
*   *(In programma)* **Distorsione a barilotto**

---

## 3. BODY (Corpo Macchina)
*La meccanica della fotocamera: cattura elettronica e tempi di scatto.*

### Esposizione (Exposure)
*   **Hero:** EV (Compensazione esposizione generale).
*   **Hero:** Shutter Speed (Tempi di posa per motion blur e luminosità).

### Sensore (Sensor / Speed)
*   **Hero:** ISO (Sensibilità alla luce).
*   **Hero:** White Balance (Bilanciamento del bianco alla fonte).

---

## 4. FILM (Pellicola)
*La chimica e il carattere visivo del supporto (il rullino scelto).*

### Sviluppo (Development / Color)
*   **Hero:** Saturazione.
*   **Hero:** Contrasto.
*   **Hero:** Fade (Quantità di innalzamento del nero per l'effetto matte/slavato).

### Texture (Materiale visibile)
*   **Hero:** Grana (Amount/Intensità).
    *   *Bottom Sheet Avanzate:* Dimensione Grana (Scale), Modalità Colore (Luma B/N o Chroma RGB).
*   *(In programma)* **Dust & Scratches:** Polvere e graffi fisici sulla pellicola.

---

## 5. DECK (Riproduttore analogico)
*Simula l'usura del nastro magnetico e la visualizzazione su tubi catodici.*

### Usura Nastro (Tape)
*   **Hero:** Tracking Jitter (Instabilità orizzontale e salti).
*   **Hero:** Dropouts (Smagnetizzazione e glitch bianchi).

### Schermo (Display)
*   **Hero:** Scanlines (Quantità di linee orizzontali).
    *   *Bottom Sheet Avanzate:* Curvatura schermo, Intensità fosfori RGB, Spessore linee.
