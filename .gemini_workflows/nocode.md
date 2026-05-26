---
description: Impedisce all'agente di apportare qualsiasi modifica ai file del progetto, limitando l'operato a risposte informative e piani.
---
Questo workflow è attivo per impedire qualsiasi modifica al codice. Segui rigorosamente queste regole:

1. Non effettuare alcuna chiamata ai tool di scrittura o modifica file (`write_to_file`, `replace_file_content`, `multi_replace_file_content`).
2. Se l'utente ti chiede di fare modifiche al codice, rispondi spiegando con precisione che la modalità "nocode" è attiva ed esponi la logica o la soluzione in formato testuale o come piano di implementazione (`implementation_plan.md`), senza applicarla.
3. Se devi eseguire comandi tramite `run_command`, assicurati che non abbiano effetti collaterali di scrittura sul codice (es. non lanciare script di build che generano file nel sorgente, o comandi di formattazione automatica con sovrascrittura).
