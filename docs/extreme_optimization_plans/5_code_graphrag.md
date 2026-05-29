# 5. Code GraphRAG (LLM AST Map)

## Problema Attuale
Lo sviluppo guidato interamente da LLM su un monorepo complesso (TypeScript per frontend, Kotlin/C++ per il modulo nativo) soffre di una severa frammentazione del contesto. Attualmente l'LLM fa affidamento su commenti "tattici" nel codice, sulle regole FSD e sui Knowledge Items manuali.
Tuttavia, quando l'LLM deve fare modifiche trasversali, il classico RAG (Retrieval-Augmented Generation) basato su vettori semantici non è in grado di comprendere la gerarchia strutturale del codice (es. chi chiama chi, o come si risolvono i path alias complessi di `@features/*`).

## La Soluzione Estrema
Costruire un **Code GraphRAG puro** in-house. 
Invece di far leggere all'LLM il testo dei file sorgente, si utilizza uno script automatizzato (basato su `tree-sitter` o `ts-morph`) che analizza l'**AST (Abstract Syntax Tree)** del progetto ad ogni commit.

Lo script estrae tutti i "Nodi" (File, Classi, Funzioni esportate, Hook) e traccia "Archi" matematici (dipendenze di Import, Chiamate a Funzione) serializzando tutto in un database a grafo in-memory (es. `graphology`) ed esportandolo come file JSON.

Quando l'LLM viene interpellato per una modifica complessa, non esplora il codice alla cieca: utilizza prima un tool CLI interno per **interrogare il grafo**.
Ad esempio: *"Estrai il sotto-grafo di tutti i componenti che chiamano `useCameraStore` fino a profondità 2"*. L'LLM riceve istantaneamente la mappa strutturale esatta delle dipendenze, capendo l'intero impatto a cascata della sua modifica.

- **Vantaggi:** Zero "allucinazioni" architetturali. L'LLM ottiene una visione a Raggi-X infallibile del monorepo, limitando il consumo di token ed eliminando la necessità di inquinare il codice sorgente con commenti tattici per fornire contesto.

## Stato Attuale e Sviluppi Futuri
- ✅ **TypeScript / React Native**: Il parser AST (tramite `tree-sitter-typescript`) è implementato e funzionante. Gestisce path alias FSD, re-export, e previene regressioni architetturali (dipendenze circolari e orfani).
- ⏳ **Kotlin & C++ (Da Fare)**: Manca l'estensione del grafo al codice nativo. I prossimi step prevedono l'uso di `tree-sitter-kotlin` e `tree-sitter-cpp` per analizzare i binding JNI e mappare completamente la pipeline della fotocamera in C++, così da collegare il grafo JavaScript direttamente alle interfacce native.
