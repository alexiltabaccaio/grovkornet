**Publication Date:** 2026-08-04

**Attachments for Grovsnap:**
1. `@[apps/mobile/src/entities/film/lib/useFilmWorklets.ts]` (Lines 106-124) - *Shows a Reanimated worklet directly updating the native C++ Nitro config from the UI thread, bypassing React entirely.*
2. `@[apps/mobile/src/widgets/control-panel/lib/useControlPanelGestures.ts]` (Lines 66-102) - *Demonstrates gesture events processed entirely on the UI thread at 60 FPS, without crossing the JavaScript bridge.*

Developing a fluid mobile camera app means dealing with high-frequency continuous events.

While working on Grovkornet, I encountered a massive bottleneck. The core engine is a highly optimized C++ pipeline processing 4K video frames. But the UI controls, like the exposure slider or the film grain intensity, were still firing a non-stop stream of events across the React Native bridge. Every micro-movement forced a state synchronization. The bridge couldn't handle the traffic, the JS thread choked, and the video feed started dropping frames.

I realized I had to stop talking to React altogether during drag gestures. 

To achieve this, I moved the entire gesture lifecycle out of the JS thread using **Reanimated Worklets**.

Here is how this architectural shift works under the hood:
1️⃣ **Bypassing the Bridge:** When a user interacts with a slider or gesture, the touch events are captured and evaluated entirely on the UI thread. The JavaScript thread isn't even aware it's happening.
2️⃣ **Direct Native Configuration:** Inside the worklet, I take the dynamic parameter values (like saturation or contrast) and write them directly to the native C++ engine (via Nitro Modules config) and to Reanimated Shared Values.
3️⃣ **Lazy Synchronization:** React state is only updated *after* the gesture ends. While the gesture is active, React is completely asleep, keeping the JS thread 100% free for other critical background tasks.

The key takeaway is domain isolation. If an event doesn't structurally change your layout or require complex business logic, JavaScript shouldn't hear about it. By keeping the JS thread completely blind to rapid UI updates, I managed to keep the camera pipeline locked at 60 FPS without sacrificing the flexibility of React Native for the rest of the app.

Have you ever used worklets to bypass the bridge and save your app's performance? 👇

#ReactNative #Worklets #Reanimated #Performance #MobileEngineering #SoftwareArchitecture #Grovkornet
