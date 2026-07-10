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

*(Bozza non ancora creata)*
