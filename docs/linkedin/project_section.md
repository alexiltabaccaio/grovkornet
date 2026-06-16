# LinkedIn Project Section

**Project Title:** 
Grovkornet: Real-Time Analog Film Camera Engine 

**Description:**
A high-performance cinematic camera ecosystem engineered to emulate analog film in real-time on mobile devices.

The Problem: Standard mobile camera libraries and filters lack the performance and physical accuracy required for true cinematic emulation, often resulting in dropped frames, battery drain, and artificial-looking post-processing.
The Solution: Designed a custom native rendering engine and a scalable mobile architecture that processes video through a single-pass GPU pipeline, physically simulating the path of light for authentic analog aesthetics without compromising device performance.

Technical & Architectural Highlights: 
• Native Rendering Engine: Bypassed standard React Native limitations by building a proprietary C++ and Kotlin engine powered by Google Filament (Physically Based Rendering). 
• Uber Shader Pipeline: Implemented a single-pass GPU rendering architecture that physically simulates optics, sensor mechanics, and chemical film development at a rock-solid 60 FPS. 
• Frontend Architecture: Structured as a Turborepo monorepo (React Native/Expo & Next.js), strictly adhering to the Feature-Sliced Design (FSD) pattern to ensure maximum scalability and maintainability. 
• In-House Tooling: Developed "Code GraphRAG", a custom AST-based static analyzer to map dependency graphs and automatically enforce architectural boundaries. 
• Performance & UI: Utilized Zustand for atomic global state handling and executed Reanimated worklets directly on the UI thread to guarantee a fluid interface with zero lag during live video streaming.

**Skills:**
 Integrated Development Environment · AI-Assisted Development · Prompt Engineering · TypeScript · React Native · Kotlin · C++ · Google Filament · Uber Shader · 3D LUT · Software Architecture · State Management