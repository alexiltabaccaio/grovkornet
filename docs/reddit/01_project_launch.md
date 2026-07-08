# Reddit Posts

## Post 1: Project Launch (Anti Self-Promo Version)

**Suggested Subreddits:** r/programming, r/reactnative, r/cpp, r/SideProject

**Title:** I'm a tobacconist by day, but I spent my nights building a high-performance C++/React Native film emulation engine using AI agents. Here is the architecture.

**Body:**

Hey everyone,

**TL;DR:** Standard React Native camera libraries couldn't handle real-time cinematic film emulation at 60 FPS. So I built a custom multi-pass GPU rendering pipeline in C++ and Kotlin, orchestrated entirely by LLMs. Codebase is public.

For the past 9 years, my day job has been running a tobacconist business. But my true passion has always been software engineering. I’ve been dedicating every spare night and weekend to coding because I want to change my life. I know I'm not meant to stay locked behind a counter forever, and I'm pushing myself to the absolute limit to make this my career.

I’ve been working on a passion project that pushed the limits of what I thought was possible on mobile. I wanted to build a real-time cinematic film emulation camera (**Grovkornet**), but the real challenge was doing it without draining the battery and maintaining a rock-solid 60 FPS.

Standard React Native camera libraries weren't enough for this level of performance. So, I decided to use this project as the ultimate test for an Agent-First IDE (**Antigravity**) to see if LLMs could handle the brutal constraints of low-level C++ and high-performance mobile rendering.

Here is the architecture I designed (and had the AI execute):

*   **Custom Native Engine:** A rendering engine built from scratch in **C++ and Kotlin**, using Google Filament.
*   **Uber Shader Pipeline:** A custom multi-pass GPU pipeline that physically emulates the path of light (lens -> sensor -> chemical development).
*   **Monorepo (FSD):** Strictly adhered to Feature-Sliced Design to keep the React Native layer and the native C++ layer completely isolated.
*   **Code GraphRAG:** Built an in-house AST analyzer to protect codebase boundaries in CI (so the AI wouldn't accidentally break the architecture during refactoring).

My biggest takeaway from this journey: When AI is writing the syntax, your **System Design and Orchestration** become the bottleneck. The AI is a phenomenal executor, but you have to be a rigorous architect to guide it through complex C++ and native integrations.

I've made the codebase public for anyone interested in seeing how C++, Filament, and React Native bridge together in a modern FSD monorepo.

📂 **GitHub (Source Code & Architecture):** https://github.com/alexiltabaccaio/grovkornet

Has anyone else tried pushing Agent-First IDEs into native performance territory? Would love to discuss the stack or answer any questions on how the C++ integration works!

*(Note: If anyone wants to actually try the compiled app and test if the 60 FPS rendering holds up on their device, I've set up a small Discord for beta testers. Any feedback on the UI or performance is incredibly welcome: https://discord.gg/cvYa4SmPaW)*
