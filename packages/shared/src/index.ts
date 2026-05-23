/**
 * @file index.ts
 * @description Single Source of Truth (SSOT) for Grovkornet film simulation and camera configurations.
 * Shared between the Expo mobile application and the Next.js web application.
 */

export interface FilmPreset {
  id: string;
  name: string;
  description: string;
  iso: number;
  grainAmount: number; // 0.0 to 1.0
  halationLevel: number; // 0.0 to 1.0
  bloomIntensity: number; // 0.0 to 1.0
  contrast: number; // -1.0 to 1.0
  colorTemperature: number; // Kelvin (e.g. 5500)
  tint: number; // -100 to 100
}

export interface CameraConfig {
  defaultResolution: { width: number; height: number };
  targetFps: number;
  enableEGLPersistentContext: boolean; // Referring to EGL Shutter Latency optimization from history
  uberShaderVersion: string; // Referring to Uber Shader architecture from history
}

export const INITIAL_CAMERA_CONFIG: CameraConfig = {
  defaultResolution: { width: 3840, height: 2160 }, // 4K UHD
  targetFps: 60,
  enableEGLPersistentContext: true,
  uberShaderVersion: "2.4.0-prod"
};

export const FEATURED_FILM_PRESETS: FilmPreset[] = [
  {
    id: "grovkornet-400",
    name: "Grovkornet 400",
    description: "Our signature cinematic analog film emulation. Rich grain, subtle halation, and warm skin tones perfect for daylight and golden hour.",
    iso: 400,
    grainAmount: 0.65,
    halationLevel: 0.40,
    bloomIntensity: 0.25,
    contrast: 0.15,
    colorTemperature: 5600,
    tint: 5
  },
  {
    id: "cinestill-800t-sim",
    name: "Tungsten 800 (Night)",
    description: "High-speed tungsten-balanced emulation. Prominent red halation around highlights and deep cinematic shadows.",
    iso: 800,
    grainAmount: 0.85,
    halationLevel: 0.90,
    bloomIntensity: 0.60,
    contrast: 0.25,
    colorTemperature: 3200,
    tint: -10
  },
  {
    id: "koda-chrome-100",
    name: "Classic Chrome 100",
    description: "Legendary fine-grain reversal film simulation. High contrast, saturated primary colors, and deep blacks.",
    iso: 100,
    grainAmount: 0.20,
    halationLevel: 0.10,
    bloomIntensity: 0.15,
    contrast: 0.40,
    colorTemperature: 5200,
    tint: 0
  },
  {
    id: "ilford-hp5-sim",
    name: "Monochrome 400",
    description: "Classic black and white emulsion. Beautiful tonal gradation, authentic silver-halide grain structure, and timeless mood.",
    iso: 400,
    grainAmount: 0.75,
    halationLevel: 0.30,
    bloomIntensity: 0.20,
    contrast: 0.35,
    colorTemperature: 5500,
    tint: 0
  }
];

export const DEFAULT_GRAIN_INTENSITY = 0.0;
export const DEFAULT_SATURATION = 1.0;
export const DEFAULT_CONTRAST = 1.0;
export const DEFAULT_CHROMATIC_ABERRATION = 0.0;
export const DEFAULT_GRAIN_SPEED = 20.0;

export const DEFAULT_ISO = 400;
export const DEFAULT_EV = 0;
export const DEFAULT_SHUTTER_SPEED = 60; // 1/60s
export const DEFAULT_TEMPERATURE = 5000; // 5000K daylight
export const DEFAULT_TINT = 0; // -100 to 100
export const DEFAULT_SELECTIVE_SATURATION = 50.0;


