# 🟦 LinkedIn

Friction kills developer velocity.

When I decided to start sharing code snippets from my monorepo, the mere thought of breaking my flow to screenshot the IDE or upload code to a third-party site was exhausting.

I am a firm believer in "developer laziness": if a manual task threatens the inner loop, you automate it before it becomes a chore. 

To solve this, I built **Grovsnap**, a zero-friction internal tool to generate branded snippets directly from my local filesystem. 

The architectural choice here was the fun part. Instead of fighting browser sandboxes with the File System Access API or building a heavy Electron app, I leveraged the dev server I was already running.

I wrote a custom Vite plugin that exposes two local middleware endpoints (`/api/fs/tree` and `/api/fs/file`). It safely serves my source code to a React frontend, actively blocking path traversal attempts outside the project root. 

No copy-pasting, no manual uploads. I just browse the file tree, select the file, pick the exact lines I need, and the tool renders it with Shiki.

*(I'm kicking off a new habit today: "Friday Logs" 🚀 for my weekly recaps, and "Tuesday Insights" 💡 to share how I solved hard problems over the last few months of silence).*

The Vite middleware code is fully open-source in the monorepo: https://github.com/alexiltabaccaio/grovkornet/tree/main/apps/grovsnap

I'm curious: how do you manage the "build vs buy" tradeoff for internal DX tools? At what point do you decide that the friction is high enough to justify building a custom solution? 👇

#PlatformEngineering #DeveloperExperience #Vite #DevTools #Grovkornet

---

# 🟧 Reddit

**Suggested Subreddits:** r/webdev, r/SideProject, r/reactjs, r/vitejs

**Title:** I built a code snippet image generator directly in my monorepo using React, Vite and Shiki.

I wanted a quick way to share code snippets, but the idea of copying code into third-party systems felt like an unnecessary extra step. Honestly, I'm a very lazy person.

So, I made a custom internal tool called **Grovsnap** [https://github.com/alexiltabaccaio/grovkornet/tree/main/apps/grovsnap]. 

What you see here is the tool in action: it's a generated snippet showing the exact custom Vite plugin that powers the app itself. 

Instead of fighting browser sandboxes or doing manual uploads, Grovsnap connects directly to my local filesystem. I wrote a custom Vite plugin to expose two local APIs (`/api/fs/tree` and `/api/fs/file`). This lets me safely browse my source code (it actively blocks path traversal attempts outside the project root), select a file, and automatically generate a styled snippet with syntax highlighting based on the file extension.

It completely removes the copy-pasting step.

I'm curious:
* How much time do you usually justify spending on internal DX tools compared to developing your main product? 
* Has anyone else built something similar to speed up their workflow?

*(Note: If anyone wants to actually try the tool or chat about dev workflows, I've set up a small **Discord** [https://discord.gg/cvYa4SmPaW] community. Any feedback is incredibly welcome!)*
