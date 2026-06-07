import { requireNativeViewManager, requireNativeModule, EventEmitter } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps } from 'react-native';

export interface NativeFilmCameraViewProps extends ViewProps {
  // @@GEN_PROPS_START@@
  ev?: number;
  targetFps?: number;
  cameraAspectRatio?: number;
  noiseReduction?: number;
  noiseReductionAuto?: boolean;
  isoAuto?: boolean;
  shutterSpeedAuto?: boolean;
  whiteBalanceAuto?: boolean;
  autoFocus?: boolean;
  iso?: number;
  exposureTime?: number;
  focusDistance?: number;
  torchState?: number;
  torchStrength?: number;
  cameraId?: string | null;
  resolutionSetting?: number;
  previewQuality?: number;
  force60fpsCrop?: boolean;
  secureViewEnabled?: boolean;
  isSelfieCamera?: boolean;
  zoom?: number;
  // @@GEN_PROPS_END@@
  onDebugUpdate?: (event: { nativeEvent: { fps: number; hwFps: number; resolution: string } }) => void;
  onExposureUpdate?: (event: { nativeEvent: { iso: number; shutterSpeed: number; focusDistance?: number } }) => void;
  onCapabilitiesUpdate?: (event: { nativeEvent: { 
    supportsFocus: boolean; 
    isoMin?: number; 
    isoMax?: number;
    availableCameras: Array<{ id: string; focalLength: number; focalLength35mm: number }>;
  } }) => void;
  onPhotoCaptured?: (event: { nativeEvent: { uri: string } }) => void;
  onTorchStateChanged?: (event: { nativeEvent: { enabled: boolean } }) => void;
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
    generatePresetPreview: async () => Promise.resolve(''),
    deleteFile: async () => Promise.resolve(false),
  };
}

export async function verifyGrovkornetAuthenticity(uri: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return await NativeFilmCameraModule.verifyGrovkornetAuthenticity(uri);
}

export async function generatePresetPreview(inputUri: string, payload: any): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return await NativeFilmCameraModule.generatePresetPreview(inputUri, payload);
}

export async function deleteFile(uri: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return await NativeFilmCameraModule.deleteFile(uri);
}

export const NativeCameraEventEmitter = new EventEmitter<any>(NativeFilmCameraModule);

export * from './errors';
export { NativeFilmCameraView };
export * from './NitroCameraConfiguration.nitro';
