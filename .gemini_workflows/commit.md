---
description: Genera un messaggio di commit Conventional Commits orientato all'utente (public-facing), senza tecnicismi di basso livello.
---
Genera un messaggio di commit in lingua inglese seguendo questi passaggi:

1. Identifica le modifiche eseguendo `git diff --cached` (o `git diff` se non c'è nulla in stage). Se il diff è troppo grande, analizza la lista dei file con `git status` e richiedi un riassunto dei cambiamenti o ispeziona i file singolarmente.
2. Formula il messaggio seguendo la convenzione **Conventional Commits**:
   - Struttura: `<type>(<scope>): <descrizione breve>`
   - Tipi comuni: `feat` (nuova feature), `fix` (bug risolto), `perf` (ottimizzazione performance), `refactor` (ristrutturazione codice), `docs` (documentazione).
   - Ambito (`scope`): opzionale ma consigliato (es. `camera`, `ui`, `settings`, `engine`).
   - La descrizione deve essere in inglese, iniziare con lettera minuscola e non terminare con il punto (es. `fix(camera): resolve preview freeze when switching mode`).
3. **Regole fondamentali per lo stile del messaggio**:
   - **User-Facing / High-Level**: Scrivi il commit come se stessi descrivendo l'aggiornamento a un utente esterno o per un changelog pubblico. Concentrati sull'impatto visibile della modifica.
   - **Nessun tecnicismo interno**: Non menzionare dettagli implementativi di basso livello, nomi di variabili interne, eccezioni specifiche del codice (es. evitare "fixed NullPointerException on line 42", "changed useSystemStore state array structure", "added check for variable x").
   - **Preferisci**:
     - *Corretto*: `fix(camera): resolve preview freeze when switching filters`
     - *Scorretto*: `fix(camera): reset shader uniform value on filter transition to avoid crash`
     - *Corretto*: `feat(settings): add debug options for testing native rendering`
     - *Scorretto*: `feat(settings): bind debug boolean state to useSystemStore and show debug panel`
4. Mostra il commit in un blocco di codice per facilitare il copia-incolla da parte dell'utente.
