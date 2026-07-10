# Contributing Guidelines

Thank you for your interest in contributing to Grovkornet! To maintain code quality, architecture consistency, and performance, please review and adhere to the guidelines below.

---

## 1. Monorepo Structure

This project is a monorepo managed with **Turborepo**. The project is split into:
* **`apps/`**: Client applications (e.g., `apps/mobile` for the Expo React Native app, `apps/web` for the web app, and `apps/grovsnap`).
* **`packages/`**: Shared code and engine modules (e.g., `packages/shared`, `packages/engine`).

### Development Commands
* **Run web client:** `npm run dev:web`
* **Run snap app:** `npm run dev:snap`
* **Run mobile app (Android with Expo Prebuild):** `npm run dev:android` (use this instead of `npm run android` to ensure native code and codegen changes are correctly intercepted and compiled).
* **Run codegen:** `npm run codegen`
* **Lint codebase:** `npm run lint`

---

## 2. Feature-Sliced Design (FSD) Architecture

We strictly follow the **Feature-Sliced Design (FSD)** architectural pattern across all applications (e.g., `apps/mobile/src`, `apps/web/src`, and `apps/grovsnap/src`).

### FSD Layers (from highest to lowest hierarchy)
1. **`app`**: App-wide setup, providers, styles, and routing.
2. **`screens`**: Page/screen layouts, composition of widgets.
3. **`widgets`**: Structural sections of a page (e.g., header, sidebar, custom gallery grids).
4. **`features`**: User actions that bring business value (e.g., `camera-controls`, `auth-by-email`).
5. **`entities`**: Business entities (e.g., `photo`, `user`, `video`).
6. **`shared`**: Reusable infrastructure components, helpers, hooks, API clients, and UI kits.

### Architectural Rules
* **Strict Dependency Flow:** You can only import from layers that are *hierarchically lower* than the current layer. Circular dependencies between modules are strictly forbidden.
* **Public APIs:** Every slice (e.g., `@features/camera-controls`) must expose its public interface via a root `index.ts` file. 
* **Imports:** Always use absolute path aliases (e.g., `@features/camera-controls`) and import only from the slice's root `index.ts`. Never perform relative deep imports (e.g., `../../features/camera-controls/ui/Button.tsx`).

---

## 3. Monorepo and Code Generation

### Camera parameters & errors
Do not manually write Kotlin/C++/Zustand boilerplate code for camera parameters or errors. Instead:
1. Modify `packages/shared/camera-parameters.json` or `packages/shared/camera-errors.json`.
2. Run `npm run codegen` to regenerate the boilerplate.

### Code GraphRAG
Before making complex or cross-platform structural changes, analyze the dependency graph using our internal GraphRAG system to prevent circular imports or unexpected cascade effects:
```bash
node packages/shared/scripts/graphrag/query.js <your_query>
```

---

## 4. State Management & Internationalization (i18n)

* **Zustand Stores:** Keep stores atomic, highly cohesive, and small (e.g., `useCameraStore`, `useGalleryStore`). Avoid monolithic stores.
* **Localization (i18n):** Never hardcode strings directly in the UI. Always use `react-i18next` for translations.

---

## 5. Performance and Native UI (NativeFilmCamera)

To maintain a fluid experience at **60 FPS** during video streaming and processing, adhere to the following rules:

* **Camera Component:** Use only the custom `NativeFilmCamera` component (which runs a multi-pass Uber Shader pipeline). Do not use `react-native-vision-camera` or `react-native-skia` directly.
* **Worklets:** Any continuous event handler between React Native and the native layer must be run as a worklet. Ensure you append the `'worklet';` directive at the top of these functions.
* **Avoid Re-renders:** Ensure UI thread performance by:
  * Wrapping callback props in `useCallback`.
  * Wrapping complex calculations in `useMemo`.
  * Wrapping leaf components in `React.memo` to avoid dropped frames during live camera feeds.

---

## 6. Testing

Run all unit tests to validate cross-platform logic and components:
* **Run tests:** `npm run test` (or use specific test workspace scripts).
* **Mutation testing:** We use Stryker for mutation testing on mobile and shared packages (e.g., `npm run test:mutation:mobile`).

---

## 7. Submission & Pull Request Flow

1. **Branch Naming:** Keep it descriptive (e.g., `feature/camera-presets` or `bugfix/worklet-render`).
2. **Pull Requests:** Ensure you fill out the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely, running linting and tests before submission.
3. **Commit Messages:** Follow standard semantic commit guidelines.
