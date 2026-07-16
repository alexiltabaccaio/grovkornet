**Publication Date:** 2026-07-21

**Attachments for Grovsnap:**
1. `@[packages/engine/android/src/main/java/com/grovkornet/nativefilmcamera/ui/NativeFilmCameraView.kt]` (Lines 227-257) - *Shows the JNI bridge: the Android surface goes straight to the C++ thread, bypassing React Native*
2. `@[apps/mobile/src/entities/lens/ui/NativeRenderer.tsx]` (Lines 6, 17-32) - *Shows the use of AnimatedComponent to send continuous updates via worklets*

React Native is amazing for building fluid user interfaces fast. But when you need to process video frames in real-time through a multi-pass custom shader at 60 FPS, the JavaScript bridge becomes your biggest enemy.

When I started building Grovkornet, my very first approach was the standard one: trying to write high-performance frame processors using Skia and VisionCamera. They are incredible tools, but passing high-resolution frames back and forth, or adapting my heavy C++ image processing logic to generic wrappers, was causing dropped frames and thermal throttling.

I had to make a hard call and scrap the entire initial implementation to migrate to a fully native camera pipeline.

I needed absolute raw performance. So, I stopped trying to make JavaScript do the heavy lifting and embraced a strict **Hybrid Pipeline**.

Here is how I architected it:
1️⃣ **React Native for the UI:** The JS thread is strictly reserved for the layout, buttons, sliders, and state management (using atomized Zustand micro-stores).
2️⃣ **Native Component (`NativeFilmCamera`):** I built a custom Android UI component. The camera frames go directly from the Android Camera2 API into my C++ Engine via JNI. JavaScript never even sees the video frames.
3️⃣ **Worklets for Continuous Events:** When a user drags a slider to change exposure or film grain, I can't afford a React re-render. I use Reanimated `'worklet'` directives to pass these continuous parameter updates directly to the native UI thread, keeping the interaction buttery smooth.

The takeaway? Cross-platform frameworks don't mean you have to write *everything* in one language. The secret to a 60 FPS mobile app is knowing exactly when to use React Native for its unparalleled UI flexibility, and when to drop down to C++/Kotlin for raw compute power.

How do you decide when to step out of your cross-platform framework and write native code? 👇

#ReactNative #Cpp #AndroidDev #MobileEngineering #SoftwareArchitecture #JNI #Performance #Grovkornet
