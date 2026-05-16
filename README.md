# Grovkornet 🎞️

> [!IMPORTANT]
> **Proprietary Software**: This repository is private. Unauthorized use, copying, or distribution is strictly prohibited.

A high-performance cinematic camera application for Android built with React Native and a custom C++/Kotlin native rendering engine (**Uber Shader**) for real-time analog film emulation.

## 🚀 Overview

Grovkornet (Swedish for "coarse-grained") is designed for filmmakers and enthusiasts who want the look and feel of analog film in a modern mobile workflow. Unlike standard filter apps, Grovkornet uses a single-pass GPU rendering pipeline that simulates the physical path of light through a cinema setup.

## 🏗️ Architecture

The app is built on a custom native module (`native-film-camera`) that replaces standard libraries like `react-native-vision-camera` and `react-native-skia` for maximum performance (stable 60 FPS).

### The Analog Metaphor (UX Hierarchy)

The interface is organized into four main physical sections:
1.  **⚙️ SYSTEM**: Technical settings, debug overlays, and language preferences.
2.  **👁️ LENS**: Physical glass settings (Camera selection, Focus, Chromatic Aberration).
3.  **📷 BODY**: Camera mechanics (ISO, Shutter Speed, Exposure Compensation, Torch).
4.  **🎞️ FILM**: Chemical development and texture (Saturation, Contrast, Grain intensity/size).

## 🚦 Pipeline de Rendering (Uber Shader)
To ensure maximum realism, the engine processes the image in the exact physical order of light:
`LENS (Optics)` ➔ `BODY (Sensor)` ➔ `FILM (Development)` ➔ `DECK (Output)`

## 🛠️ Tech Stack
- **Frontend**: React Native, Expo, TypeScript, Reanimated, Zustand.
- **Native**: Kotlin, C++, OpenGL ES 2.0/3.0.
- **Architecture**: Single-pass Uber Shader rendering.

## 🏁 Getting Started

### Prerequisites
- Node.js & npm
- Android Studio & NDK
- An Android device (Physical device recommended for 60 FPS testing)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npm run android
   ```

## 🧪 Testing & Quality
The project includes a comprehensive test suite:
- **Lint**: `npm run lint` (ESLint) and `./gradlew lintDebug` (Android).
- **Unit Tests**: `npm run test` (Jest) and `./gradlew testDebugUnitTest` (Native).

---

Built with ❤️ for cinematic mobile photography.
