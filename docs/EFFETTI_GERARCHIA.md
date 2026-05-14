# Grovkornet: Gerarchia degli Effetti a 3 Livelli

Questa struttura definisce l'interfaccia utente e l'organizzazione logica di tutti i filtri disponibili nell'applicazione. La gerarchia è organizzata su 3 livelli:

1.  **Macro-Categoria (Ambiente):** I tab principali dell'applicazione.
2.  **Modulo (Effetto):** L'effetto specifico (che può essere acceso o spento).
3.  **Parametri (Terza Fase):** I singoli slider e interruttori regolabili dall'utente.

---

## 1. LENS (L'Obiettivo)
*Simula i difetti ottici e fisici del vetro della telecamera.*

### Vignettatura
*   **Intensità:** Quanto è scuro il nero ai bordi.
*   **Raggio:** Quanto l'ombra penetra verso il centro dell'inquadratura.

### Aberrazione Cromatica (Color Bleed)
*   **Sfasamento:** La distanza di separazione tra il canale Rosso e il canale Blu (sbavatura sui bordi).

### Distorsione Lente
*   **Quantità:** L'effetto "barilotto" o fish-eye che curva leggermente l'immagine.

---

## 2. COLOR (Lo Sviluppo)
*Riguarda la manipolazione cromatica pura dell'immagine (Color Grading).*

### Color Grading Base
*   **Saturazione:** L'intensità dei colori (da bianco e nero a fluo).
*   **Contrasto:** La differenza tra le aree chiare e quelle scure.
*   **Temperatura:** Regolazione da tonalità fredde (blu) a calde (arancione).
*   **Tinta:** Regolazione da tonalità verdi a magenta.

### Livello del Nero (Fade)
*   **Quantità:** Prende i neri profondi e li "alza" trasformandoli in grigi opachi (effetto pellicola sbiadita).

---

## 3. TAPE (Il Nastro Magnetico)
*Simula il degrado fisico del supporto di registrazione (VHS, nastro).*

### Grana (Grain)
*   **Intensità:** L'opacità e la visibilità generale della grana.
*   **Scala (Dimensione):** Quanto è grande ogni singolo "chicco" di rumore.
*   **Velocità (Flicker):** La frequenza con cui la grana sfarfalla e si aggiorna nel tempo.
*   **Modalità Colore:** Interruttore per scegliere tra Luma (grana in bianco e nero) o Chroma (grana colorata RGB).

### Tracking Jitter (Distorsione orizzontale)
*   **Frequenza:** Quante volte al secondo o al minuto il nastro "salta".
*   **Ampiezza:** Quanto è violento lo spostamento laterale dell'immagine durante il salto.

### Dropouts (Artefatti)
*   **Intensità:** La quantità di graffi o piccoli puntini bianchi orizzontali dovuti alla smagnetizzazione.

---

## 4. CRT (Il Tubo Catodico)
*Rappresenta come il video finale viene visualizzato su una vecchia televisione.*

### Scanlines (Righe di scansione)
*   **Spessore:** La larghezza delle bande nere orizzontali.
*   **Opacità:** Quanto le righe sono marcate rispetto al video sottostante.

### Curvatura Schermo
*   **Quantità Warp:** L'effetto convesso che fa sembrare lo schermo bombato in avanti.

### Fosfori RGB
*   **Intensità:** La visibilità del micro-pattern a griglia (i sub-pixel rossi, verdi e blu dello schermo).
