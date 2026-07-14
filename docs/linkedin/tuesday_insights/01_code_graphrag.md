**Attachments for Grovsnap:**
1. `@[packages/shared/scripts/graphrag/src/algorithms/fsd-validator.js]` (Lines 64-90) - *Mostra il cuore della validazione delle regole architetturali*
2. `@[packages/shared/scripts/graphrag/src/cli/query.js]` (Lines 46-62) - *Mostra l'interfaccia CLI usata dall'LLM per interrogare il grafo*

LLM Agents are incredible tools that write code at a frightening speed. But there's a catch: if you don't set rigid boundaries, they will destroy your architecture in a matter of days.

For my project **Grovkornet** (a mobile app for native cinematic film emulation built with React Native and C++), I decided to push the use of AI to the absolute limit.
But I immediately noticed an issue: during complex refactorings, the agent struggles to "see" the entire ecosystem and the cascade impact of its changes. The result? Circular dependencies and constant violations of our Feature-Sliced Design (FSD) architecture.

To solve this, I had to stop acting like a programmer and start acting like an Architect. I built an internal tool: **Code GraphRAG**.

It's a custom AST (Abstract Syntax Tree) analyzer that dynamically maps the entire codebase and creates a relational database of dependencies (from TypeScript, all the way down to C++ and Kotlin).

In my previous project (T-Facile), I successfully used ESLint to enforce architectural boundaries. But Grovkornet is different. I needed a unified graph that could speak natively to an LLM using Mermaid, bridging those cross-language boundaries that standard TS tools can't see.

Now, before the agent is allowed to execute any structural change, it must query this graph via CLI:
1️⃣ **Node Search:** It asks "If I modify `useCameraStore`, what components will break downstream?"
2️⃣ **Architectural Validation:** A CLI command (`npm run analyze`) verifies that there are no FSD violations (e.g., a 'shared' module importing from 'features'), dependency cycles, or orphaned files.
3️⃣ **Visual Mapping:** The system returns Mermaid-formatted graphs to the model, allowing it to "visualize" the structure before touching it.

An AI is a formidable executor, but for complex projects, *you* must be the architect. You can't control *how* it writes every single line, but you have to build the *load-bearing walls* it safely moves within.

Have you ever experienced issues with LLM-generated "spaghetti code" while scaling your projects? 👇

#LLMs #SoftwareArchitecture #GraphRAG #FeatureSlicedDesign #SystemDesign #TypeScript #ReactNative