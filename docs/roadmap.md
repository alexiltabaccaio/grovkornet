# Roadmap e Bug Tracker - Grovkornet

## 🐛 Bug da Sistemare
- [ ] **Risoluzione bloccata:** La modifica della risoluzione (4K, Full HD, ecc.) non ha effetto, indipendentemente dalla selezione. Indagare e ripristinare il corretto cambio di risoluzione del sensore fotocamera.

## ✨ Nuove Feature e Miglioramenti
- [ ] **Miglioramento sensibilità input (Dito troppo sensibile):** Implementare una curva non lineare (es. esponenziale o quadratica) per i controlli a scorrimento (slider/dito). I valori devono cambiare lentamente all'inizio per permettere regolazioni minuziose di precisione e accelerare man mano che si allunga il movimento.
- [ ] **Affinamento Range Aberrazione Cromatica:** Il range attuale (1-200) non copre bene le esigenze micro e macro.
  *Approccio suggerito (Pro):* Mantenere un'interfaccia utente pulita (es. valori da 0 a 100 o percentuali) ma far lavorare il motore sotto il cofano con valori a virgola mobile (float) ad alta precisione (es. da `0.000` a `10.000`). Questo permette di avere una risoluzione altissima per le micro-regolazioni senza complicare l'interfaccia.
- [ ] **Preview in Bassa Risoluzione in Galleria:** Inserire un sistema che mostri istantaneamente una miniatura (preview a bassa risoluzione) nella galleria contestualmente allo scatto della foto, per garantire un feedback visivo istantaneo all'utente prima che il salvataggio in alta definizione sia concluso.
- [ ] **Sincronizzazione Torcia con il Sistema:** Connettere lo stato della torcia dell'app a quello globale di Android.
  - Se la torcia del sistema è accesa all'apertura dell'app, l'app deve riconoscerlo e partire con la torcia su ON.
  - Se l'app viene chiusa con la torcia su ON, la torcia di sistema deve rimanere accesa (previa verifica delle policy e API di Android per non bloccare il demone hardware della fotocamera).
- [ ] **Preview in Alta Definizione (Risoluzione):** Aggiungere un pulsante/sub-parametro al parametro "RISOLUZIONE" che permetta di attivare la preview in alta definizione (es. forzare il feed della fotocamera in 4K invece del Full HD di default). 
  - Aggiungere un popup/avviso: *"Attenzione: richiede alte prestazioni"*.
- [ ] **Ristrutturazione UI Sub-Parametri:** I sub-parametri non devono più essere considerati come "gemelli" ma come veri e propri **controlli (pulsanti, leve, switch)**. Ogni parametro principale avrà un sub-parametro primario collegato (es. Il parametro "Torcia" avrà un sub-parametro con pulsanti `ON/OFF`).
- [ ] **Adattamento formato**
 - Attualmente il formato 65:24 non tiene conto della zona nascosta da footer ed header. Ottimizzare quindi i formati perchè siano perfettamente visibili escludendo footer e header dalla zona di visuale.
## 📜 Regole e Linee Guida di Progetto
- **Target:** Play Store / Pubblicazione Ufficiale.
- **Regola:** È obbligatorio verificare il rispetto del regolamento del Google Play Store e le best practice di sicurezza Android prima di procedere con modifiche (specialmente su permessi, background task e hardware).
