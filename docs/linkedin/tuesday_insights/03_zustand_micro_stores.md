**Publication Date:** 2026-07-28

**Attachments for Grovsnap:**
1. `@[apps/mobile/src/entities/camera/model/useCameraStore.ts]` (Lines 24-52) - *Shows a strictly atomized Zustand store, containing only what is absolutely necessary for the camera state.*
2. `@[apps/mobile/src/screens/camera/ui/CameraScreen.tsx]` (Lines 43-45) - *Shows a component selectively subscribing to a single action using `useShallow`, preventing UI thread blockages.*

Managing state in a typical React Native app is straightforward. Managing state in a 60 FPS mobile camera app without destroying performance is a nightmare.

When building Grovkornet, one of the biggest challenges was preventing unnecessary React re-renders. When a user drags a slider to change the exposure, or toggles the torch, the UI needs to update instantly, but I can't afford to block the JS thread while streaming high-resolution video.

My first instinct was to use a massive, centralized store for the entire app. This was a mistake. A single state change would trigger a cascade of re-renders across the component tree, dropping frames and causing thermal throttling.

The solution? **Atomized Zustand Micro-Stores.**

Here is the architecture I adopted to keep Grovkornet buttery smooth:
1️⃣ **Strictly Segmented Stores:** Instead of one big `useAppStore`, I have dozens of tiny, feature-specific stores (`useCameraStore`, `useGalleryStore`, `useControlPanelStore`). This ensures that local state changes in one domain don't accidentally trigger re-renders in unrelated components.
2️⃣ **Surgical Subscriptions:** Components never subscribe to the entire store. I enforce the strict use of `useShallow` selectors. If a component only needs the `triggerCapture` function, it will only re-render if that specific function reference changes (which is never).
3️⃣ **Delegating to Worklets:** For high-frequency continuous updates (like scrubbing a slider), I bypass the React state entirely. I send the data directly to the native C++ engine via Reanimated worklets. The React state is only synchronized when the gesture is completely finished.

The takeaway: The architecture of your state tree is critical. In high-performance apps, isolation is just as important as reactivity.

Have you ever had to break down a monolithic store to fix performance issues in your apps? 👇

#ReactNative #Zustand #StateManagement #Performance #MobileEngineering #SoftwareArchitecture #Grovkornet
