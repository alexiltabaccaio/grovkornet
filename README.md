# Grovkornet 🎞️

> [!IMPORTANT]
> **Proprietary Software**: This repository is private. Unauthorized use, copying, or distribution is strictly prohibited.

A high-performance cinematic camera ecosystem built with React Native and a custom C++/Kotlin native rendering engine (**Uber Shader**) for real-time analog film emulation.

## 🚀 Overview

Grovkornet (Swedish for "coarse-grained") is designed for filmmakers and enthusiasts who want the look and feel of analog film in a modern mobile workflow. Unlike standard filter apps, Grovkornet uses a single-pass GPU rendering pipeline that simulates the physical path of light through a cinema setup.

## 🏗️ Architecture (Monorepo)

The project is structured as a **Turborepo** monorepo to clearly separate concerns and prepare for future ecosystem expansions:

- **`apps/mobile`**: The core React Native/Expo mobile camera application.
- **`apps/web`**: The Next.js web application (e.g., for galleries or web dashboard).
- **`packages/engine`**: The standalone custom native rendering engine (C++/Kotlin) that replaces standard libraries for maximum performance (stable 60 FPS).
- **`packages/shared`**: Shared types, utilities, and configuration.

### The Analog Metaphor (UX Hierarchy)

The interface is organized into four main physical sections:
1.  **⚙️ SYSTEM**: Technical settings, debug overlays, and language preferences.
2.  **👁️ LENS**: Physical glass settings (Camera selection, Focus, Chromatic Aberration, Bloom).
3.  **📷 BODY**: Camera mechanics and capture setup (ISO, Shutter Speed, Torch, Aspect Ratio, Resolution, FPS).
4.  **🎞️ FILM**: Chemical development and texture (Temperature, Tint, Saturation, Grain, Sharpening, Noise Reduction).

## 🚦 Rendering Pipeline (Uber Shader)
To ensure maximum realism, the engine processes the image in the exact physical order of light:
`LENS (Optics)` ➔ `BODY (Sensor)` ➔ `FILM (Development)` ➔ `DECK (Output)`

## 🛠️ Tech Stack
- **Mobile**: React Native, Expo, TypeScript, Reanimated, Zustand.
- **Web**: Next.js, React, Firebase, Vercel Analytics.
- **Native Engine**: Kotlin, C++, OpenGL ES 2.0/3.0.
- **Tooling**: Turborepo, ESLint, Prettier.

## 🏁 Getting Started

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
- **Lint**: `npm run lint` (ESLint) via Turbo.
- **Unit Tests**: `npm run test` (Jest) and native unit testing inside the engine package.

---

Built with ❤️ for cinematic photography.
