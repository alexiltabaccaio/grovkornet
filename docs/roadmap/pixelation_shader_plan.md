# Architettura "Retro": Finta Bassa Risoluzione vs Vera Bassa Risoluzione

## L'Idea
Attualmente, se si scatta una foto a risoluzione estremamente bassa (es. 144p), l'immagine generata è fisicamente molto piccola (`256x144`). Questo porta a problemi di visualizzazione sulle piattaforme moderne: le gallerie dei dispositivi (iOS/Android) e i social network (Instagram, TikTok) forzeranno un upscaling bilineare sull'immagine, distruggendo l'effetto "pixelato" e rendendo l'immagine sfocata e poco nitida.

**Soluzione proposta:** 
Renderizzare l'immagine in uscita ad **alta risoluzione** (es. 1080p o 4K) ma applicare una **"finta" bassa risoluzione** tramite lo shader nativo (Uber Shader) della nostra `NativeFilmCamera`.

## Vantaggi (Perché è lo standard nel settore)

1. **Condivisione e Visualizzazione Perfetta:** Essendo il file salvato in alta definizione, non subirà alcuno stretching bilineare indesiderato da parte del sistema operativo. I pixel "giganti" rimarranno perfetti, nitidi e definiti ("blocky") indipendentemente da dove la foto venga visualizzata.
2. **Controllo sul Dithering & Scaling:** Possiamo usare il campionamento *Nearest-Neighbor* o implementare algoritmi di dithering (Bayer, Floyd-Steinberg) e color-banding (es. 8-bit/16-bit) prima di ingrandire il pixel, per un look retro 100% autentico in stile vecchie digitali o telefoni a conchiglia.
3. **Sovrapposizioni ad Alta Definizione:** Possiamo sovrapporre watermark (come il classico timestamp arancione) ad alta risoluzione *sopra* l'immagine pixelata. Il contrasto visivo tra un font ultra-nitido e una foto molto sgranata aumenta il realismo "retro".
4. **Layout della Galleria:** Mantenere un'unica risoluzione per tutte le immagini in output semplifica moltissimo la gestione della griglia/galleria in React Native, evitando problemi di layout tra foto 4K e foto 144p.

## Implementazione Futura

1. Aggiungere un parametro `pixelation_factor` o `downsample_scale` in `packages/shared/camera-parameters.json`.
2. Utilizzare il comando `npm run codegen` per generare i binding C++, Kotlin e TypeScript.
3. Aggiornare l'Uber Shader in C++ (`packages/engine/...`) per arrotondare/quantizzare le coordinate UV a griglie fisse, campionando l'immagine a risoluzioni inferiori ma disegnandola sul canvas 1080p.
