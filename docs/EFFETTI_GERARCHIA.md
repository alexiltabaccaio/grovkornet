# Grovkornet: Gerarchia degli Effetti e UX (Metafora Analogica)

Questa struttura definisce l'interfaccia utente, organizzata simulando fedelmente le componenti fisiche di un setup cinematografico. 

## 🗺️ UX Design Pattern (Modello a Bottom Sheet)
Il sistema è progettato per essere rapido da usare con una mano (run-and-gun), nascondendo la complessità ai principianti ma lasciandola accessibile ai professionisti.

1. **[Section] Section:** I bottoni di navigazione in basso per le sezioni fisiche principali (es. System, Lens, Body).
2. **[Section Header] Section Header:** La grande scritta in alto nel pannello aperto che identifica la sezione attiva.
3. **[Module] Module:** Il sottomenù o famiglia di effetti all'interno della sezione (es. Esposizione, Texture).
4. **[Parameter] Parameter:** L'etichetta del parametro (es. Grana, Torcia), visibile come pulsante nella riga dei controlli. La sua selezione attiva il parametro e apre la tendina inferiore.
5. **[Panel] Parameter Panel (Pannello Generale):** Lo spazio visibile di default quando la bottom sheet viene aperta a `-50px`. Ospita il controllo primario essenziale (l'interruttore ON/OFF o lo slider principale, es. l'Intensità della Grana o la Saturazione Master) ancorato visivamente al parametro.
6. **[SubPanel] SubParameter Panel (Zona Avanzata/Premium):** Regolazioni aggiuntive e di fino (es. Dimensione Grana, Chroma, Saturazione Specifica per Colore). Sono collocate nella parte più profonda del pannello (zona nascosta sotto lo zero, ad es. a `-90px`) e diventano visibili unicamente tramite "progressive disclosure", ovvero tirando attivamente in alto la bottom sheet.

---

## 🚦 Pipeline di Rendering (L'Ordine del Segnale)
Per garantire il massimo realismo, l'Uber Shader elabora l'immagine applicando i filtri nel percorso fisico esatto della luce:
`LENS (Ottica)` ➔ `BODY (Sensore)` ➔ `FILM (Sviluppo)` ➔ `DECK (Nastro/Schermo)`
*(La tab SYSTEM è esclusa in quanto non fa parte del flusso ottico)*

---

## 🏗️ Albero della Gerarchia

### 1. ⚙️ SYSTEM (Sistema)
> *Impostazioni tecniche dell'applicazione, posizionate per prime a sinistra nell'interfaccia.*
* **Module: Preferenze**
  * `[Parameter]` **Lingua** (Cambio lingua UI)
  * `[Parameter]` **Debug** (Statistiche on-screen per FPS, rendering)

### 2. 👁️ LENS (L'Obiettivo)
> *Tutto ciò che riguarda il vetro e l'ottica fisica prima che la luce tocchi il sensore.*
* **Module: Ottica (Optics)**
  * `[Parameter]` **Selezione Fotocamera** (Grandangolo, Teleobiettivo)
  * `[Parameter]` **Messa a Fuoco** (Distanza, AF/MF)
* **Module: Difetti Ottici (Flaws)**
  * `[Parameter]` **Aberrazione Cromatica** (Amount)
  * `[Parameter]` **Bloom** (Diffusione luci)

### 3. 📷 BODY (Corpo Macchina)
> *La meccanica della fotocamera: cattura elettronica, illuminazione ed hardware integrato.*
* **Module: Esposizione (Exposure)**
  * `[Parameter]` **ISO** (Sensibilità alla luce)
  * `[Parameter]` **Shutter Speed** (Tempi di posa per motion blur)
  * `[Parameter]` **EV** (Compensazione esposizione generale)
* **Module: Illuminazione (Lighting)**
  * `[Parameter]` **Torcia** (On / Off)
    * ↳ `[SubParameter]` *Intensità Torcia (Dimmer)*
* **Module: Acquisizione (Capture)**
  * `[Parameter]` **Aspect Ratio** (Formato, es. 65:24)
  * `[Parameter]` **Resolution Setting** (Risoluzione video, es. 1080p)
    * ↳ `[SubParameter]` *4K Preview Warning Toggle*
  * `[Parameter]` **FPS Setting** (Framerate)

### 4. 🎞️ FILM (Pellicola)
> *La chimica e il carattere visivo del supporto (il rullino scelto).*
* **Module: Sviluppo (Development / Color)**
  * `[Parameter]` **Temperature** (Bilanciamento colore)
  * `[Parameter]` **Tint** (Tinta verde/magenta)
  * `[Parameter]` **Saturazione** (Generale Master)
    * ↳ `[SubParameter]` *Saturazione Selettiva (Range per colore specifico)*
  * `[Parameter]` **Contrasto**
* **Module: Texture (Materiale visibile)**
  * `[Parameter]` **Grana** (Amount / Intensità)
    * ↳ `[SubParameter]` *Dimensione Grana (Scale), Modalità Colore (Luma B/N o Chroma RGB)*
  * `[Parameter]` **Sharpening** (Nitidezza)
  * `[Parameter]` **Noise Reduction** (Riduzione Rumore)

