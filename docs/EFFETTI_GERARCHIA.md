# Grovkornet: Gerarchia degli Effetti e UX (Metafora Analogica)

Questa struttura definisce l'interfaccia utente, organizzata simulando fedelmente le componenti fisiche di un setup cinematografico. 

## 🗺️ UX Design Pattern (Modello a Bottom Sheet)
Il sistema è progettato per essere rapido da usare con una mano (run-and-gun), nascondendo la complessità ai principianti ma lasciandola accessibile ai professionisti.

1. **[Tab] Macro-Categoria:** Le sezioni fisiche principali (es. System, Lens, Body).
2. **[Pill] Modulo:** Il sottomenù o famiglia di effetti (es. Esposizione, Texture).
3. **[Box] Parametro "Hero":** Il parametro più importante e usato (es. Intensità della Grana), immediatamente visibile come box a scorrimento.
4. **[Sheet] Impostazioni Avanzate:** Accessibile tramite un Long Press o Doppio Tap. Fa scivolare un pannello con le regolazioni di fino.

---

## 🚦 Pipeline di Rendering (L'Ordine del Segnale)
Per garantire il massimo realismo, l'Uber Shader elabora l'immagine applicando i filtri nel percorso fisico esatto della luce:
`LENS (Ottica)` ➔ `BODY (Sensore)` ➔ `FILM (Sviluppo)` ➔ `DECK (Nastro/Schermo)`
*(La tab SYSTEM è esclusa in quanto non fa parte del flusso ottico)*

---

## 🏗️ Albero della Gerarchia

### 1. ⚙️ SYSTEM (Sistema)
> *Impostazioni tecniche dell'applicazione, posizionate per prime a sinistra nell'interfaccia.*
* **Modulo: Preferenze**
  * `[Hero]` **Lingua** (Cambio lingua UI)
  * `[Hero]` **Debug** (Statistiche on-screen per FPS, rendering)

### 2. 👁️ LENS (L'Obiettivo)
> *Tutto ciò che riguarda il vetro e l'ottica fisica prima che la luce tocchi il sensore.*
* **Modulo: Ottica (Optics)**
  * `[Hero]` **Selezione Fotocamera** (Grandangolo, Teleobiettivo)
  * `[Hero]` **Messa a Fuoco** (Distanza, AF/MF)
* **Modulo: Difetti Ottici (Flaws)**
  * `[Hero]` **Aberrazione Cromatica** (Amount)
  * `[Hero]` *(In programma)* **Vignettatura**
  * `[Hero]` *(In programma)* **Distorsione a barilotto**

### 3. 📷 BODY (Corpo Macchina)
> *La meccanica della fotocamera: cattura elettronica, illuminazione e hardware integrato.*
* **Modulo: Esposizione (Exposure)**
  * `[Hero]` **EV** (Compensazione esposizione generale)
  * `[Hero]` **Shutter Speed** (Tempi di posa per motion blur)
* **Modulo: Sensore (Sensor)**
  * `[Hero]` **ISO** (Sensibilità alla luce)
* **Modulo: Illuminazione (Lighting)**
  * `[Hero]` **Torcia** (On / Off / Auto)
* **Modulo: Audio (Audio)**
  * `[Hero]` **Microfono** (On / Off)

### 4. 🎞️ FILM (Pellicola)
> *La chimica e il carattere visivo del supporto (il rullino scelto).*
* **Modulo: Sviluppo (Development / Color)**
  * `[Hero]` **Temperature** (Bilanciamento colore)
  * `[Hero]` **Saturazione**
  * `[Hero]` **Contrasto**
  * `[Hero]` **Fade** (Effetto matte/slavato sui neri)
* **Modulo: Texture (Materiale visibile)**
  * `[Hero]` **Grana** (Amount / Intensità)
    * ↳ `[Avanzate]` *Dimensione Grana (Scale), Modalità Colore (Luma B/N o Chroma RGB)*
  * `[Hero]` *(In programma)* **Dust & Scratches** (Polvere e graffi)

### 5. 📺 DECK (Riproduttore analogico)
> *Simula l'usura del nastro magnetico e la visualizzazione su tubi catodici.*
* **Modulo: Usura Nastro (Tape)**
  * `[Hero]` **Tracking Jitter** (Instabilità orizzontale e salti)
  * `[Hero]` **Dropouts** (Smagnetizzazione e glitch bianchi)
* **Modulo: Schermo (Display)**
  * `[Hero]` **Scanlines** (Quantità di linee orizzontali)
    * ↳ `[Avanzate]` *Curvatura schermo, Intensità fosfori RGB, Spessore linee*
