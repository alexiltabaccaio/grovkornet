import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { useCameraWorklets } from '@features/camera-controls/lib/useCameraWorklets';

export const useParameterControlData = (parameter: ParameterType) => {
  // Styles store fields
  const stylesState = useStylesStore(
    useShallow((s) => ({
      grainIntensity: s.grainIntensity,
      setGrainIntensity: s.setGrainIntensity,
      sharpening: s.sharpening,
      setSharpening: s.setSharpening,
      saturation: s.saturation,
      setSaturation: s.setSaturation,
      contrast: s.contrast,
      setContrast: s.setContrast,
      chromaticAberration: s.chromaticAberration,
      setChromaticAberration: s.setChromaticAberration,
    }))
  );

  // Hardware store fields
  const hw = useHardwareStore(
    useShallow((s) => ({
      temperature: s.temperature,
      setTemperature: s.setTemperature,
      temperatureAuto: s.temperatureAuto,
      setTemperatureAuto: s.setTemperatureAuto,
      tint: s.tint,
      setTint: s.setTint,
      ev: s.ev,
      setEv: s.setEv,
      iso: s.iso,
      setIso: s.setIso,
      isoAuto: s.isoAuto,
      setIsoAuto: s.setIsoAuto,
      shutterSpeed: s.shutterSpeed,
      setShutterSpeed: s.setShutterSpeed,
      shutterSpeedAuto: s.shutterSpeedAuto,
      setShutterSpeedAuto: s.setShutterSpeedAuto,
      focusDistance: s.focusDistance,
      setFocusDistance: s.setFocusDistance,
      focusAuto: s.focusAuto,
      setFocusAuto: s.setFocusAuto,
      capabilities: s.capabilities,
    }))
  );

  const isEvDisabled = useDerivedValue(() => {
    return !hw.isoAuto.value && !hw.shutterSpeedAuto.value;
  });

  const worklets = useCameraWorklets();

  switch (parameter) {
    case 'grain':
      return {
        value: stylesState.grainIntensity,
        minValue: 0,
        maxValue: 1.0,
        centerValue: undefined,
        onChange: stylesState.setGrainIntensity,
        onUpdateWorklet: worklets.updateGrain,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => stylesState.setGrainIntensity(0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'sharpening':
      return {
        value: stylesState.sharpening,
        minValue: 0,
        maxValue: 1.0,
        centerValue: undefined,
        onChange: stylesState.setSharpening,
        onUpdateWorklet: worklets.updateSharpening,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => stylesState.setSharpening(0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'saturation':
      return {
        value: stylesState.saturation,
        minValue: 0,
        maxValue: 2.0,
        centerValue: 1.0,
        onChange: stylesState.setSaturation,
        onUpdateWorklet: worklets.updateSaturation,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          const val = Math.round((v - 1) * 100);
          return val > 0 ? `+${val}` : `${val}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => stylesState.setSaturation(1.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'contrast':
      return {
        value: stylesState.contrast,
        minValue: 0,
        maxValue: 2.0,
        centerValue: 1.0,
        onChange: stylesState.setContrast,
        onUpdateWorklet: worklets.updateContrast,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          const val = Math.round((v - 1) * 100);
          return val > 0 ? `+${val}` : `${val}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => stylesState.setContrast(1.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'chromatic_aberration':
      return {
        value: stylesState.chromaticAberration,
        minValue: 0.0,
        maxValue: 2.0,
        centerValue: undefined,
        onChange: stylesState.setChromaticAberration,
        onUpdateWorklet: worklets.updateChromaticAberration,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => stylesState.setChromaticAberration(0.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'temperature':
      return {
        value: hw.temperature,
        minValue: 2000,
        maxValue: 10000,
        centerValue: undefined,
        onChange: hw.setTemperature,
        onUpdateWorklet: worklets.updateTemperature,
        isAuto: hw.temperatureAuto,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v)}K`;
        },
        hideValueInAuto: true,
        autoValueText: 'AWB',
        onReset: () => hw.setTemperatureAuto(true),
        onToggleAuto: hw.setTemperatureAuto,
        disabled: undefined,
      };
    case 'tint':
      return {
        value: hw.tint,
        minValue: -100,
        maxValue: 100,
        centerValue: 0,
        onChange: hw.setTint,
        onUpdateWorklet: worklets.updateTint,
        isAuto: hw.temperatureAuto,
        valueFormatter: (v: number) => {
          'worklet';
          const rounded = Math.round(v);
          return rounded > 0 ? `+${rounded}` : `${rounded}`;
        },
        hideValueInAuto: true,
        autoValueText: 'AWB',
        onReset: () => hw.setTemperatureAuto(true),
        onToggleAuto: hw.setTemperatureAuto,
        disabled: undefined,
      };
    case 'ev':
      return {
        value: hw.ev,
        minValue: -2.0,
        maxValue: 2.0,
        centerValue: 0.0,
        onChange: hw.setEv,
        onUpdateWorklet: worklets.updateEv,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => hw.setEv(0),
        onToggleAuto: undefined,
        disabled: isEvDisabled,
      };
    case 'iso':
      return {
        value: hw.iso,
        minValue: hw.capabilities.isoMin ?? 50,
        maxValue: hw.capabilities.isoMax ?? 3200,
        centerValue: undefined,
        onChange: hw.setIso,
        onUpdateWorklet: worklets.updateIso,
        isAuto: hw.isoAuto,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v)}`;
        },
        hideValueInAuto: true,
        autoValueText: 'AUTO',
        onReset: () => hw.setIsoAuto(true),
        onToggleAuto: hw.setIsoAuto,
        disabled: undefined,
      };
    case 'shutter_speed':
      return {
        value: hw.shutterSpeed,
        minValue: 1,
        maxValue: 1000,
        centerValue: undefined,
        onChange: hw.setShutterSpeed,
        onUpdateWorklet: worklets.updateShutterSpeed,
        isAuto: hw.shutterSpeedAuto,
        valueFormatter: (v: number) => {
          'worklet';
          return `1/${Math.round(v)}`;
        },
        hideValueInAuto: true,
        autoValueText: 'AUTO',
        onReset: () => hw.setShutterSpeedAuto(true),
        onToggleAuto: hw.setShutterSpeedAuto,
        disabled: undefined,
      };
    case 'focus':
      return {
        value: hw.focusDistance,
        minValue: 0,
        maxValue: 10,
        centerValue: undefined,
        onChange: hw.setFocusDistance,
        onUpdateWorklet: worklets.updateFocusDistance,
        isAuto: hw.focusAuto,
        valueFormatter: (v: number) => {
          'worklet';
          if (v <= 0.1) return '∞';
          const distanceInMeters = 1 / v;
          if (distanceInMeters >= 1) {
            return `${distanceInMeters.toFixed(1)}m`;
          } else {
            return `${((distanceInMeters * 100)).toFixed(0)}cm`;
          }
        },
        hideValueInAuto: true,
        autoValueText: 'AF',
        onReset: () => hw.setFocusAuto(true),
        onToggleAuto: hw.setFocusAuto,
        disabled: undefined,
      };
    default:
      return null;
  }
};
