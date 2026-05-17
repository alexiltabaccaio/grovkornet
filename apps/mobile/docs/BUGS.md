# 🐛 Grovkornet: Registro Bug e Problemi Noti (Bug Tracker)

Questo documento traccia i bug noti riscontrati nell'applicazione, suddivisi per area di competenza, descrivendo il comportamento anomalo e le potenziali soluzioni architetturali o di UX.

---

## 👁️ LENS: Difetti Ottici (Optics & Flaws)

### 1. Aberrazione Cromatica anomala in fase di scatto
* **Sintomo / Comportamento:** Quando si scatta una foto, viene generata un'evidente aberrazione cromatica ai lati dell'immagine finale catturata. Questo difetto non si manifesta durante la live preview.
* **Causa Ipotizzata / Reale:** Mancanza dei parametri di wrapping (`GL_CLAMP_TO_EDGE`) nel processore offscreen (`OffscreenFilmProcessor.kt`). In assenza di questi, OpenGL ES 2.0 applica il default `GL_REPEAT`, causando il wrap-around dei pixel dal lato opposto dell'immagine durante lo shift di campionamento dell'aberrazione cromatica.
* **Stato:** 🟢 Risolto (impostato `GL_CLAMP_TO_EDGE` su `WRAP_S` e `WRAP_T` in `OffscreenFilmProcessor.kt`).

---

## 🎞️ FILM: Sviluppo e Colore (Development)

### 2. Incoerenza parametro TEMPERATURE nel passaggio da Manuale ad AUTO
* **Sintomo / Comportamento:** Quando la regolazione della temperatura colore (`TEMPERATURE`) viene riportata in modalità `AUTO`, il precedente valore manuale impostato dall'utente (es. `2000K`) resta memorizzato "dietro le quinte" nello stato interno. Di conseguenza, mentre il feed video si adatta automaticamente a un valore bilanciato (circa `5000K`), se l'utente tocca lo schermo e trascina il dito verso l'alto per riprendere la regolazione manuale, il colore sbalza bruscamente al vecchio `2000K`, causando una brutta incoerenza visiva e un'esperienza utente discontinua.
* **Soluzione Pensata / Proposta:** Resettare esplicitamente il valore manuale memorizzato dietro le quinte al valore neutro di default (`5000K`) nel momento esatto in cui l'utente torna in modalità `AUTO`. In questo modo, al successivo tocco/swipe, la regolazione ripartirà in modo fluido e coerente da `5000K`.
* **Stato:** 🟢 Risolto (i valori manuali tornano al `DEFAULT` quando si abilita l'AUTO nello store hardware).
