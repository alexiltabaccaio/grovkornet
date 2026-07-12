**Attachments for Grovsnap:**
1. `@[packages/shared/scripts/graphrag/src/algorithms/fsd-validator.js]` (Lines 64-90) - *Mostra il cuore della validazione delle regole architetturali*
2. `@[packages/shared/scripts/graphrag/src/cli/query.js]` (Lines 46-62) - *Mostra l'interfaccia CLI usata dall'LLM per interrogare il grafo*

# 🟦 LinkedIn

LLM Agents are incredible tools that write code at a frightening speed. But there's a catch: if you don't set rigid boundaries, they will destroy your architecture in a matter of days.

For my project **Grovkornet** (a mobile app for native cinematic film emulation built with React Native and C++), I decided to push the use of AI to the absolute limit.
But I immediately noticed an issue: during complex refactorings, the agent struggles to "see" the entire ecosystem and the cascade impact of its changes. The result? Circular dependencies and constant violations of our Feature-Sliced Design (FSD) architecture.

To solve this, I had to stop acting like a programmer and start acting like an Architect. I built an internal tool: **Code GraphRAG**.

It's a custom AST (Abstract Syntax Tree) analyzer that dynamically maps the entire codebase and creates a relational database of dependencies (from TypeScript, all the way down to C++ and Kotlin).

You might be wondering: why not use Dependency Cruiser or ESLint? Because my stack spans TypeScript, Kotlin, and C++. I needed a unified graph that could speak natively to an LLM using Mermaid, bridging cross-language boundaries.

Now, before the agent is allowed to execute any structural change, it must query this graph via CLI:
1️⃣ **Node Search:** It asks "If I modify `useCameraStore`, what components will break downstream?"
2️⃣ **Architectural Validation:** A CLI command (`npm run analyze`) verifies that there are no FSD violations (e.g., a 'shared' module importing from 'features'), dependency cycles, or orphaned files.
3️⃣ **Visual Mapping:** The system returns Mermaid-formatted graphs to the model, allowing it to "visualize" the structure before touching it.

An AI is a formidable executor, but for complex projects, *you* must be the architect. You can't control *how* it writes every single line, but you have to build the *load-bearing walls* it safely moves within.

Have you ever experienced issues with LLM-generated "spaghetti code" while scaling your projects? 👇

#LLMs #SoftwareArchitecture #GraphRAG #FeatureSlicedDesign #SystemDesign #TypeScript #ReactNative

---

# 🟧 Reddit (r/Grovkornet)

**Title:** Tuesday Insights #1: How I stop the LLMs from destroying the Grovkornet codebase (Code GraphRAG)

Welcome to the very first Tuesday Insights! Every Tuesday, I'll deep dive into the technical challenges of building Grovkornet and the tools I've created to solve them.

If you read my original launch post, you might remember that I rely heavily on AI to build the C++ and React Native engines. They are incredible at writing boilerplate, but they have a fatal flaw: they lack "architectural vision". When doing complex refactoring across the monorepo, the model would often introduce circular dependencies or violate our Feature-Sliced Design (FSD) boundaries because it couldn't see the whole picture.

If you don't give the AI strict boundaries, it will turn your codebase into spaghetti code in a matter of days.

So, I built an internal tool called **Code GraphRAG** [https://github.com/alexiltabaccaio/grovkornet/tree/main/packages/shared/scripts/graphrag/].

It's a custom AST (Abstract Syntax Tree) scanner that reads our entire TypeScript, Kotlin, and C++ codebase and builds a dynamic dependency graph. 

I know what you're thinking: *"Why reinvent the wheel instead of using ESLint plugin boundaries or Dependency Cruiser?"*. The answer is my stack. Grovkornet relies heavily on native C++ and Kotlin. Standard TS tools couldn't give the LLM a unified cross-language graph formatted in conversational Mermaid. So, I built one.

Now, before the agent is allowed to make any structural changes, it uses this CLI tool to:
1. **Query the impact:** "If I change `useCameraStore`, what else breaks?"
2. **Validate boundaries:** Run `npm run analyze` to ensure no FSD rules are broken (e.g., a shared module importing a feature).
3. **Visualize:** Generate a Mermaid graph so the agent can literally "see" the architecture.

By giving the model a map of the territory, I can let it run fast without worrying about it breaking the core architecture. You can't control every line of code it writes, but you *must* build the load-bearing walls.

The code for GraphRAG is open-source in the monorepo if you want to see how we manage LLMs! Let me know if you have any questions on how it works.
