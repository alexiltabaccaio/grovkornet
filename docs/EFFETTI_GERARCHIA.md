# Grovkornet: Gerarchia degli Effetti e UX (Metafora Analogica)

Questa struttura definisce l'interfaccia utente, organizzata simulando fedelmente le componenti fisiche di un setup cinematografico. 

## 🗺️ UX Design Pattern (Modello a Bottom Sheet)
Il sistema è progettato per essere rapido da usare con una mano (run-and-gun), nascondendo la complessità ai principianti ma lasciandola accessibile ai professionisti.

1. **[Section] Section:** Le sezioni fisiche principali (es. System, Lens, Body).
2. **[Module] Module:** Il sottomenù o famiglia di effetti (es. Esposizione, Texture).
3. **[Parameter] Parameter:** Il parametro più importante e usato (es. Intensità della Grana), immediatamente visibile come box a scorrimento.
4. **[SubParameter] SubParameter:** Accessibile tramite un Long Press o Doppio Tap. Fa scivolare un pannello con le regolazioni di fino.

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


