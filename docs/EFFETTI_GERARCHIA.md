# Grovkornet: Gerarchia degli Effetti e UX (Metafora Analogica)

Questa struttura definisce l'interfaccia utente, organizzata simulando fedelmente le componenti fisiche di un setup cinematografico. 

## 🗺️ UX Design Pattern (Modello a Bottom Sheet)
Il sistema è progettato per essere rapido da usare con una mano (run-and-gun), nascondendo la complessità ai principianti ma lasciandola accessibile ai professionisti.

1. **[Section] Section:** I bottoni di navigazione in basso per le sezioni fisiche principali (es. System, Lens, Body).
2. **[Section Header] Section Header:** La grande scritta in alto nel pannello aperto che identifica la sezione attiva.
3. **[Module] Module:** Il sottomenù o famiglia di effetti all'interno della sezione (es. Esposizione, Texture).
4. **[Parameter] Parameter:** L'etichetta del parametro (es. Grana, Torcia), visibile come pulsante nella riga dei controlli. La sua selezione attiva il parametro e apre la tendina inferiore.
5. **[Parameter Extension] Estensione del Parametro (Core Slot / Dock):** Lo spazio a -35px che si crea immediatamente sotto il parametro appena selezionato. Ospita il controllo primario (l'interruttore ON/OFF o lo slider principale come l'Intensità della Grana) ancorato visivamente al parametro.
6. **[SubParameter] SubParameter:** Regolazioni aggiuntive e di fino (es. Dimensione Grana, Chroma). Sono collocate nella parte più profonda del pannello (a -90px) e diventano visibili solo tirando attivamente su la bottom sheet.

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

### 3. 📷 BODY (Corpo Macchina)
> *La meccanica della fotocamera: cattura elettronica, illuminazione e hardware integrato.*
* **Module: Esposizione (Exposure)**
  * `[Parameter]` **ISO** (Sensibilità alla luce)
  * `[Parameter]` **Shutter Speed** (Tempi di posa per motion blur)
  * `[Parameter]` **EV** (Compensazione esposizione generale)
* **Module: Illuminazione (Lighting)**
  * `[Parameter]` **Torcia** (On / Off)
    * ↳ `[SubParameter]` *Intensità Torcia (Dimmer)*

### 4. 🎞️ FILM (Pellicola)
> *La chimica e il carattere visivo del supporto (il rullino scelto).*
* **Module: Sviluppo (Development / Color)**
  * `[Parameter]` **Temperature** (Bilanciamento colore)
  * `[Parameter]` **Saturazione**
  * `[Parameter]` **Contrasto**
* **Module: Texture (Materiale visibile)**
  * `[Parameter]` **Grana** (Amount / Intensità)
    * ↳ `[SubParameter]` *Dimensione Grana (Scale), Modalità Colore (Luma B/N o Chroma RGB)*


