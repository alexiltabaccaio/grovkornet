import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useLensStore, useLensWorklets } from '@entities/lens';
import { ParameterType } from '@entities/system';

export const useParameterControlData = (parameter: ParameterType) => {
  // Film store fields
  const film = useFilmStore(
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
      bloomIntensity: s.bloomIntensity,
      setBloomIntensity: s.setBloomIntensity,
      temperature: s.temperature,
      setTemperature: s.setTemperature,
      temperatureAuto: s.temperatureAuto,
      setTemperatureAuto: s.setTemperatureAuto,
      tint: s.tint,
      setTint: s.setTint,
    }))
  );

  // Body store fields
  const body = useBodyStore(
    useShallow((s) => ({
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
      capabilities: s.capabilities,
    }))
  );

  // Lens store fields
  const lens = useLensStore(
    useShallow((s) => ({
      focusDistance: s.focusDistance,
      setFocusDistance: s.setFocusDistance,
      focusAuto: s.focusAuto,
      setFocusAuto: s.setFocusAuto,
    }))
  );

  const isEvDisabled = useDerivedValue(() => {
    return !body.isoAuto.value && !body.shutterSpeedAuto.value;
  });

  const filmWorklets = useFilmWorklets();
  const bodyWorklets = useBodyWorklets();
  const lensWorklets = useLensWorklets();

  switch (parameter) {
    case 'grain':
      return {
        value: film.grainIntensity,
        minValue: 0,
        maxValue: 2.0,
        centerValue: undefined,
        onChange: film.setGrainIntensity,
        onUpdateWorklet: filmWorklets.updateGrain,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setGrainIntensity(0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'sharpening':
      return {
        value: film.sharpening,
        minValue: 0,
        maxValue: 1.0,
        centerValue: undefined,
        onChange: film.setSharpening,
        onUpdateWorklet: filmWorklets.updateSharpening,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setSharpening(0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'saturation':
      return {
        value: film.saturation,
        minValue: 0,
        maxValue: 2.0,
        centerValue: 1.0,
        onChange: film.setSaturation,
        onUpdateWorklet: filmWorklets.updateSaturation,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          const val = Math.round((v - 1) * 100);
          return val > 0 ? `+${val}` : `${val}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setSaturation(1.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'contrast':
      return {
        value: film.contrast,
        minValue: 0,
        maxValue: 2.0,
        centerValue: 1.0,
        onChange: film.setContrast,
        onUpdateWorklet: filmWorklets.updateContrast,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          const val = Math.round((v - 1) * 100);
          return val > 0 ? `+${val}` : `${val}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setContrast(1.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'chromatic_aberration':
      return {
        value: film.chromaticAberration,
        minValue: 0.0,
        maxValue: 2.0,
        centerValue: undefined,
        onChange: film.setChromaticAberration,
        onUpdateWorklet: filmWorklets.updateChromaticAberration,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setChromaticAberration(0.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'bloom':
      return {
        value: film.bloomIntensity,
        minValue: 0.0,
        maxValue: 1.0,
        centerValue: undefined,
        onChange: film.setBloomIntensity,
        onUpdateWorklet: filmWorklets.updateBloomIntensity,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setBloomIntensity(0.0),
        onToggleAuto: undefined,
        disabled: undefined,
      };
    case 'temperature':
      return {
        value: film.temperature,
        minValue: 2000,
        maxValue: 10000,
        centerValue: undefined,
        onChange: film.setTemperature,
        onUpdateWorklet: filmWorklets.updateTemperature,
        isAuto: film.temperatureAuto,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v)}K`;
        },
        hideValueInAuto: true,
        autoValueText: 'AWB',
        onReset: () => film.setTemperatureAuto(true),
        onToggleAuto: film.setTemperatureAuto,
        disabled: undefined,
      };
    case 'tint':
      return {
        value: film.tint,
        minValue: -100,
        maxValue: 100,
        centerValue: 0,
        onChange: film.setTint,
        onUpdateWorklet: filmWorklets.updateTint,
        isAuto: film.temperatureAuto,
        valueFormatter: (v: number) => {
          'worklet';
          const rounded = Math.round(v);
          return rounded > 0 ? `+${rounded}` : `${rounded}`;
        },
        hideValueInAuto: true,
        autoValueText: 'AWB',
        onReset: () => film.setTemperatureAuto(true),
        onToggleAuto: film.setTemperatureAuto,
        disabled: undefined,
      };
    case 'ev':
      return {
        value: body.ev,
        minValue: -2.0,
        maxValue: 2.0,
        centerValue: 0.0,
        onChange: body.setEv,
        onUpdateWorklet: bodyWorklets.updateEv,
        isAuto: undefined,
        valueFormatter: (v: number) => {
          'worklet';
          return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => body.setEv(0),
        onToggleAuto: undefined,
        disabled: isEvDisabled,
      };
    case 'iso':
      return {
        value: body.iso,
        minValue: body.capabilities.isoMin ?? 50,
        maxValue: body.capabilities.isoMax ?? 3200,
        centerValue: undefined,
        onChange: body.setIso,
        onUpdateWorklet: bodyWorklets.updateIso,
        isAuto: body.isoAuto,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v)}`;
        },
        hideValueInAuto: true,
        autoValueText: 'AUTO',
        onReset: () => body.setIsoAuto(true),
        onToggleAuto: body.setIsoAuto,
        disabled: undefined,
      };
    case 'shutter_speed':
      return {
        value: body.shutterSpeed,
        minValue: 1,
        maxValue: 1000,
        centerValue: undefined,
        onChange: body.setShutterSpeed,
        onUpdateWorklet: bodyWorklets.updateShutterSpeed,
        isAuto: body.shutterSpeedAuto,
        valueFormatter: (v: number) => {
          'worklet';
          return `1/${Math.round(v)}`;
        },
        hideValueInAuto: true,
        autoValueText: 'AUTO',
        onReset: () => body.setShutterSpeedAuto(true),
        onToggleAuto: body.setShutterSpeedAuto,
        disabled: undefined,
      };
    case 'focus':
      return {
        value: lens.focusDistance,
        minValue: 0,
        maxValue: 10,
        centerValue: undefined,
        onChange: lens.setFocusDistance,
        onUpdateWorklet: lensWorklets.updateFocusDistance,
        isAuto: lens.focusAuto,
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
        onReset: () => lens.setFocusAuto(true),
        onToggleAuto: lens.setFocusAuto,
        disabled: undefined,
      };
    default:
      return null;
  }
};
