import { requireNativeViewManager, requireNativeModule } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps } from 'react-native';

export interface NativeFilmCameraViewProps extends ViewProps {
  saturation?: number;
  contrast?: number;
  grainIntensity?: number;
  grainChroma?: number;
  grainSize?: number;
  grainEnabled?: boolean;
  chromaticAberration?: number;
  aberrationDirection?: number;
  isoAuto?: boolean;
  shutterSpeedAuto?: boolean;
  whiteBalanceAuto?: boolean;
  autoFocus?: boolean;
  iso?: number;
  exposureTime?: number;
  ev?: number;
  whiteBalance?: number;
  focusDistance?: number;
  cameraId?: string;
  torchState?: number;
  torchStrength?: number;
  noiseReduction?: number;
  sharpening?: number;
  aspectRatio?: number;
  targetFps?: number;
  onDebugUpdate?: (event: { nativeEvent: { fps: number; hwFps: number; resolution: string } }) => void;
  onExposureUpdate?: (event: { nativeEvent: { iso: number; shutterSpeed: number; focusDistance?: number } }) => void;
  onCapabilitiesUpdate?: (event: { nativeEvent: { 
    supportsFocus: boolean; 
    isoMin?: number; 
    isoMax?: number;
    availableCameras: Array<{ id: string; focalLength: number; focalLength35mm: number }>;
  } }) => void;
  onPhotoCaptured?: (event: { nativeEvent: { uri: string } }) => void;
}

const NativeFilmCameraView: React.ComponentType<NativeFilmCameraViewProps> =
  requireNativeViewManager('NativeFilmCamera');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let NativeFilmCameraModule: any;
try {
  NativeFilmCameraModule = requireNativeModule('NativeFilmCamera');
} catch {
  NativeFilmCameraModule = {
    verifyGrovkornetAuthenticity: async () => Promise.resolve(true),
  };
}

export async function verifyGrovkornetAuthenticity(uri: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return await NativeFilmCameraModule.verifyGrovkornetAuthenticity(uri);
}

export { NativeFilmCameraView };
