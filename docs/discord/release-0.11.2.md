🚀 Release: Version 0.11.2 (Beta Update) @everyone - A new update is rolling out for our testers!

This release focuses heavily on performance optimizations, image quality improvements, and crushing several UI bugs reported during our first beta phase. Here is what is new:

✨ What's New & Improved:

🔹 Rendering & Performance: Implemented a "zero-bridge frame dropper" to ensure seamless transitions into the gallery without hardware freezes. We also enabled React Native's New Architecture on Android for smoother layout animations.
🔹 Improved Image Quality: Resolved jagged edges (aliasing) on captured photos using a progressive downscaling pipeline. Saved photo quality has been increased to beautifully preserve your film grain details.
🔹 Battery & Thermals Optimization: The camera engine now automatically enters deep-sleep mode after 10 seconds of inactivity in the gallery, protecting your device's battery and thermals.
🔹 Stable Navigation: Refactored the control panel and gallery viewers to provide a reliable, glitch-free touch experience. No more interface freezes when swiping!
🔹 Community: We've officially added the Discord community invite to our website's Coming Soon page. 

🐛 Bug Fixes:

🔸 Fixed the viewfinder offset shifting unexpectedly after returning from the gallery.
🔸 Eliminated thumbnail flickering and black screens when rapidly skipping through photos.
🔸 Fixed a visual glitch that caused the camera control panel to briefly flash on the screen.
🔸 Removed the maximum quality warning banner in the resolution panel for 4K captures.

Keep the feedback coming! If you encounter any new issues, drop them in #bug-report 🛠️ or join the discussion in #general 💬.

Have fun shooting! 📸
