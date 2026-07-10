# 🟦 LinkedIn

Today I'm kicking off my "Friday Log" 🚀: every Friday I'll share what I've been working on during the week and the technical solutions adopted for Grovkornet.

The idea is to share snippets of my code, but there was a problem: taking manual screenshots of the IDE or pasting snippets into external tools is slow, tedious, and breaks the workflow.

"If you have to do something twice a week, automate it." 🛠️

So I built **Grovsnap**, an internal tool tailored specifically for my project. No copy-pasting: it connects directly to my local filesystem. I just select the file, and Grovsnap generates a branded graphic, automatically applying syntax highlighting based on the file extension.

In the attached image you can see the "engine" of this automation (a custom Vite script). Instead of fighting browser sandboxes, I exposed two local APIs (`/api/fs/tree` and `/api/fs/file`) that allow me to safely browse the source code, actively blocking path traversal attempts outside the project root.

Want to try the app or explore the source code?
🌐 Website: https://grovkornet.com/
💬 Discord Community: https://discord.gg/cvYa4SmPaW
📂 GitHub: https://github.com/alexiltabaccaio/grovkornet

Optimizing internal processes is essential when working on complex projects. How much time do you dedicate to building custom tools compared to developing the main product? 👇

#BuildInPublic #PlatformEngineering #DeveloperExperience #Vite #Grovkornet

---

# 🟧 Reddit

**Suggested Subreddits:** r/webdev, r/SideProject, r/reactjs, r/vitejs

**Title:** I built a code snippet image generator directly in my monorepo using Vite, Shiki, and React.

I wanted a quick way to share code snippets, but the idea of copying code into third-party systems felt like an unnecessary extra step. Honestly, I'm a very lazy person.

So, I made a custom internal tool called **Grovsnap** [https://github.com/alexiltabaccaio/grovkornet/tree/main/apps/grovsnap]. 

What you see here is the tool in action: it's a generated snippet showing the exact custom Vite plugin that powers the app itself. 

Instead of fighting browser sandboxes or doing manual uploads, Grovsnap connects directly to my local filesystem. I wrote a custom Vite plugin to expose two local APIs (`/api/fs/tree` and `/api/fs/file`). This lets me safely browse my source code (it actively blocks path traversal attempts outside the project root), select a file, and automatically generate a styled snippet with syntax highlighting based on the file extension.

It completely removes the copy-pasting step.

I'm curious:
* How much time do you usually justify spending on internal DX tools compared to developing your main product? 
* Has anyone else built something similar to speed up their workflow?

*(Note: If anyone wants to actually try the tool or chat about dev workflows, I've set up a **small Discord community** [https://discord.gg/cvYa4SmPaW]. Any feedback is incredibly welcome!)*
