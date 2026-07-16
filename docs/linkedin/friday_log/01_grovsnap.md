**Publication Date:** 2026-07-10

**Attachment for Grovsnap:** `@[apps/grovsnap/vite-plugin-local-fs.ts]` (Lines 92-147) - *Shows the custom Vite middleware that securely exposes the local filesystem*

Friction kills developer velocity.

When I decided to start sharing code snippets from my monorepo, the mere thought of breaking my flow to screenshot the IDE or upload code to a third-party site was exhausting.

I am a firm believer in "developer laziness": if a manual task threatens the inner loop, you automate it before it becomes a chore. 

To solve this, I built **Grovsnap**, a zero-friction internal tool to generate branded snippets directly from my local filesystem. 

The architectural choice here was the fun part. Instead of fighting browser sandboxes with the File System Access API or building a heavy Electron app, I leveraged the dev server I was already running.

I wrote a custom Vite plugin that exposes two local middleware endpoints (`/api/fs/tree` and `/api/fs/file`). It safely serves my source code to a React frontend, actively blocking path traversal attempts outside the project root. 

No copy-pasting, no manual uploads. I just browse the file tree, select the file, pick the exact lines I need, and the tool renders it with Shiki.

The Vite middleware code is fully open-source in the monorepo: https://github.com/alexiltabaccaio/grovkornet/tree/main/apps/grovsnap

I'm curious: how do you manage the "build vs buy" tradeoff for internal DX tools? At what point do you decide that the friction is high enough to justify building a custom solution? 👇

#PlatformEngineering #DeveloperExperience #Vite #DevTools #Grovkornet