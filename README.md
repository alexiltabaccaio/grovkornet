# Grovkornet 🎞️

> [!IMPORTANT]
> **Proprietary Software**: This repository is private. Unauthorized use, copying, or distribution is strictly prohibited.

A high-performance cinematic camera ecosystem built with React Native and a custom C++/Kotlin native rendering engine (**Google Filament**-based Uber Shader) for real-time analog film emulation.

## 🚀 Overview

Grovkornet (Swedish for "coarse-grained") is designed for filmmakers and enthusiasts who want the look and feel of analog film in a modern mobile workflow. Unlike standard filter apps, Grovkornet uses a single-pass GPU rendering pipeline that simulates the physical path of light through a cinema setup, ensuring a stable 60 FPS experience.

## 🏗️ Architecture

The project is structured as a **Turborepo** monorepo to clearly separate concerns and prepare for future ecosystem expansions:

- **`apps/mobile`**: The core React Native/Expo mobile camera application.
- **`apps/web`**: The Next.js web application (e.g., for galleries or web dashboard).
- **`packages/engine`**: The standalone custom native rendering engine (C++/Kotlin/Filament) that replaces standard libraries for maximum performance.
- **`packages/shared`**: Shared types, utilities, and configuration.

### Feature-Sliced Design (FSD)

Inside the applications (like `apps/mobile`), the codebase strictly follows the **Feature-Sliced Design (FSD)** methodology. The code is organized by layers (`app`, `screens`, `widgets`, `features`, `entities`, `shared`) to ensure a clear separation of concerns, strict dependency rules, and scalable feature development. 

To enforce these rules and prevent architectural degradation (like circular dependencies or boundary violations), the project utilizes a custom **Code GraphRAG** tool (AST-based static analyzer) that runs architectural verifications.

## 🎛️ The Analog Metaphor (UX Hierarchy)

The interface is organized into four main physical sections, designed for run-and-gun filmmaking:

1.  **⚙️ SYSTEM**: Technical settings, debug overlays, and presets profiles.
2.  **👁️ LENS**: Physical glass settings (Camera selection, Focus).
3.  **📷 BODY**: Camera mechanics, capture setup, and ISP signal processing (ISO, Shutter Speed, Torch, Noise Reduction, Sharpening, Aspect Ratio, Resolution, FPS).
4.  **🎞️ FILM**: Chemical development, grain texture, and creative print artifacts (Temperature, Tint, Saturation, Contrast, Grain, Chromatic Aberration, Bloom, Vignette, Chroma Shift, Tape Jitter, Scanlines, Pixelation).

## 🚦 Rendering Pipeline (Uber Shader)

To ensure maximum realism, the engine processes the image in the exact physical order of light:
`LENS (Optics)` ➔ `BODY (Sensor / Processing)` ➔ `FILM (Development / Artifacts)` ➔ `DECK (Output)`

## 🛠️ Tech Stack

- **Mobile**: React Native, Expo, TypeScript, Reanimated, Zustand.
- **Web**: Next.js, React, Vercel Analytics.
- **Native Engine**: Kotlin, C++, Google Filament (Physically Based Rendering).
- **Tooling**: Turborepo, ESLint, commit-and-tag-version.

## 🏁 Development Guide

### Prerequisites
- Node.js & npm
- Android Studio & NDK
- A physical Android/iOS device (Recommended for 60 FPS testing)

### Installation
1. Clone the repository
2. Install monorepo dependencies:
   ```bash
   npm install
   ```
3. Run the development server for the mobile app:
   ```bash
   npm run dev:android
   # or for iOS: npm run dev:mobile -- --ios
   ```
4. Alternatively, use Turbo to run tasks across workspaces:
   ```bash
   turbo run dev
   ```

> [!WARNING]
> **Expo Commands & Monorepo Context**: Never run `npx expo run:android` or other `npx expo` commands directly in the project root directory. Doing so will generate native files in the wrong location and cause build errors (due to mismatched `minSdkVersion`). Always use the root-level scripts (e.g. `npm run android` / `npm run dev:android`) or run commands inside `apps/mobile/`.

## 🧪 Testing & Quality
The project includes a comprehensive test suite:
- **Lint**: `npm run lint` (ESLint) from the project root via Turbo.
- **Unit Tests (Mobile)**: `npm run test` (Jest) inside `apps/mobile/`.
- **Native Tests (Engine)**: `npm run test:cpp` or `expo-module test` inside `packages/engine/`.

## 🏷️ Versioning & Releases

The project uses [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) to automate versioning and changelog generation.

### 1. Commit Guidelines
To ensure changes are correctly grouped in the `CHANGELOG.md`, always follow the **Conventional Commits** standard:
- `feat(scope)`: A new feature (e.g., `feat(camera): add custom presets`)
- `fix(scope)`: A bug fix (e.g., `fix(ui): resolve glass effect position`)
- `perf(scope)`: A performance optimization (e.g., `perf(engine): optimize native blur`)
- `refactor(scope)`: Code refactoring with no behavior changes (e.g., `refactor(shared): centralize store configuration`)
- `docs(scope)`: Documentation changes (e.g., `docs: translate comments to english`)

### 2. How to Release
1. Ensure all features are tested and stable on the `dev` branch.
2. Merge `dev` into `main`:
   ```bash
   git checkout main
   git merge dev
   ```
3. Run the release script to bump versions and generate the `CHANGELOG.md` automatically:
   ```bash
   npm run release
   ```
4. Push the release commit and tags to the remote repository:
   ```bash
   git push --follow-tags origin main
   ```
5. Merge `main` back into `dev` to keep the branch versions synchronized:
   ```bash
   git checkout dev
   git merge main
   ```

---

Built with ❤️ for cinematic photography.
