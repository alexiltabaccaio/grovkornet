import React from 'react';
import { StyleSheet } from 'react-native';
import { useHardwareStore } from '../model/useHardwareStore';
import { useStylesStore } from '../model/useStylesStore';
import { NativeFilmCamera, NativeFilmCameraRef } from '@entities/camera/ui/NativeFilmCamera';
import { useEvent, useDerivedValue, SharedValue } from 'react-native-reanimated';
import { useUIStore } from '../model/useUIStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';
import { FlashOverlay } from './FlashOverlay';

interface ConnectedFilmCameraProps {
  cameraKey?: number;
}

interface ExposureUpdatePayload {
  iso: number;
  shutterSpeed: number;
  focusDistance?: number;
  noiseReduction?: number;
}

interface DebugUpdatePayload {
  fps: number;
  hwFps: number;
  resolution: string;
}

export const ConnectedFilmCamera = ({ cameraKey }: ConnectedFilmCameraProps) => {
  const hwStore = useHardwareStore();
  const styleStore = useStylesStore();
  const cameraRef = React.useRef<NativeFilmCameraRef>(null);
  const isCapturing = useUIStore(state => state.isCapturing);

  // Trigger scatto nativo quando lo store UI cambia
  React.useEffect(() => {
    if (isCapturing && cameraRef.current) {
      cameraRef.current.takePhoto();
      
      // Feedback visivo: Se siamo in AUTO, forziamo temporaneamente l'UI su HQ.
      // Il successivo aggiornamento hardware (entro 200ms) lo riporterà a FAST.
      if (styleStore.noiseReductionAuto.value) {
        updateSharedValue(styleStore.noiseReductionMode, 2);
      }
    }
  }, [isCapturing, styleStore.noiseReductionAuto, styleStore.noiseReductionMode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exposureHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as ExposureUpdatePayload;
    if (hwStore.isoAuto.value) {
      updateSharedValue(hwStore.iso, nativeEvent.iso);
    }
    if (hwStore.shutterSpeedAuto.value) {
      updateSharedValue(hwStore.shutterSpeed, nativeEvent.shutterSpeed);
    }
    if (hwStore.focusAuto.value && nativeEvent.focusDistance !== undefined) {
      updateSharedValue(hwStore.focusDistance, nativeEvent.focusDistance);
    }
    if (styleStore.noiseReductionAuto.value && nativeEvent.noiseReduction !== undefined) {
      updateSharedValue(styleStore.noiseReductionMode, nativeEvent.noiseReduction);
    }
  }, ['onExposureUpdate']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugHandler = useEvent((event: any) => {
    'worklet';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeEvent = (event.nativeEvent || event) as DebugUpdatePayload;
    updateSharedValue(hwStore.fps, nativeEvent.fps);
    updateSharedValue(hwStore.hwFps, nativeEvent.hwFps);
    // eslint-disable-next-line react-hooks/immutability
    hwStore.resolution.value = nativeEvent.resolution;
  }, ['onDebugUpdate']);

  const resolvedNoiseReduction = useDerivedValue(() => {
    return styleStore.noiseReductionAuto.value ? -1 : styleStore.noiseReductionMode.value;
  });

  return (
    <>
      <NativeFilmCamera
        ref={cameraRef}
        key={`camera-${cameraKey}`}
        style={StyleSheet.absoluteFill}
        saturation={styleStore.saturation as unknown as SharedValue<number | undefined>}
        contrast={styleStore.contrast as unknown as SharedValue<number | undefined>}
        chromaticAberration={styleStore.chromaticAberration as unknown as SharedValue<number | undefined>}
        aberrationDirection={styleStore.aberrationDirection as unknown as SharedValue<number | undefined>}
        grainIntensity={styleStore.grainIntensity as unknown as SharedValue<number | undefined>}
        grainChroma={styleStore.grainChroma as unknown as SharedValue<number | undefined>}
        grainSize={styleStore.grainSize as unknown as SharedValue<number | undefined>}
        grainEnabled={styleStore.grainEnabled as unknown as SharedValue<boolean | undefined>}
        iso={hwStore.iso as unknown as SharedValue<number | undefined>}
        exposureTime={hwStore.shutterSpeed as unknown as SharedValue<number | undefined>}
        ev={hwStore.ev as unknown as SharedValue<number | undefined>}
        whiteBalance={hwStore.temperature as unknown as SharedValue<number | undefined>}
        isoAuto={hwStore.isoAuto as unknown as SharedValue<boolean | undefined>}
        shutterSpeedAuto={hwStore.shutterSpeedAuto as unknown as SharedValue<boolean | undefined>}
        whiteBalanceAuto={hwStore.temperatureAuto as unknown as SharedValue<boolean | undefined>}
        autoFocus={hwStore.focusAuto as unknown as SharedValue<boolean | undefined>}
        focusDistance={hwStore.focusDistance as unknown as SharedValue<number | undefined>}
        cameraId={hwStore.cameraId}
        torchState={hwStore.torchState as unknown as SharedValue<number | undefined>}
        torchStrength={hwStore.torchStrength as unknown as SharedValue<number | undefined>}
        noiseReduction={resolvedNoiseReduction as unknown as SharedValue<number | undefined>}
        sharpening={styleStore.sharpening as unknown as SharedValue<number | undefined>}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCapabilitiesUpdate={(event: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const nativeEvent = (event?.nativeEvent || event) as unknown;
          if (nativeEvent) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
            hwStore.setCapabilities(nativeEvent as any);
          }
        }}
        onDebugUpdate={debugHandler}
        onExposureUpdate={exposureHandler}
      />
      <FlashOverlay />
    </>
  );
};
