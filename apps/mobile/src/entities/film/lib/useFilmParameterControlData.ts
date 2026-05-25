import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '../model/useFilmStore';
import { useFilmWorklets } from './useFilmWorklets';
import { ParameterControlData } from '@shared/lib/parameter/types';
import { FilmStore } from '../model/types';

export type FilmParameterType =
  | 'grain'
  | 'sharpening'
  | 'saturation'
  | 'contrast'
  | 'chromatic_aberration'
  | 'bloom'
  | 'temperature'
  | 'tint';

type SelectedFilmState = Pick<
  FilmStore,
  | 'grainIntensity'
  | 'setGrainIntensity'
  | 'sharpening'
  | 'setSharpening'
  | 'saturation'
  | 'setSaturation'
  | 'contrast'
  | 'setContrast'
  | 'chromaticAberration'
  | 'setChromaticAberration'
  | 'bloomIntensity'
  | 'setBloomIntensity'
  | 'temperature'
  | 'setTemperature'
  | 'temperatureAuto'
  | 'setTemperatureAuto'
  | 'tint'
  | 'setTint'
>;

export const useFilmParameterControlData = (
  parameter: FilmParameterType
): ParameterControlData => {
  const film = useFilmStore(
    useShallow((s) => {
      switch (parameter) {
        case 'grain':
          return {
            grainIntensity: s.grainIntensity,
            setGrainIntensity: s.setGrainIntensity,
          };
        case 'sharpening':
          return {
            sharpening: s.sharpening,
            setSharpening: s.setSharpening,
          };
        case 'saturation':
          return {
            saturation: s.saturation,
            setSaturation: s.setSaturation,
          };
        case 'contrast':
          return {
            contrast: s.contrast,
            setContrast: s.setContrast,
          };
        case 'chromatic_aberration':
          return {
            chromaticAberration: s.chromaticAberration,
            setChromaticAberration: s.setChromaticAberration,
          };
        case 'bloom':
          return {
            bloomIntensity: s.bloomIntensity,
            setBloomIntensity: s.setBloomIntensity,
          };
        case 'temperature':
          return {
            temperature: s.temperature,
            setTemperature: s.setTemperature,
            temperatureAuto: s.temperatureAuto,
            setTemperatureAuto: s.setTemperatureAuto,
          };
        case 'tint':
          return {
            tint: s.tint,
            setTint: s.setTint,
            temperatureAuto: s.temperatureAuto,
            setTemperatureAuto: s.setTemperatureAuto,
          };
      }
    })
  ) as unknown as SelectedFilmState;

  const filmWorklets = useFilmWorklets();

  switch (parameter) {
    case 'grain':
      return {
        value: film.grainIntensity,
        minValue: 0,
        maxValue: 2.0,
        onChange: film.setGrainIntensity,
        onUpdateWorklet: filmWorklets.updateGrain,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setGrainIntensity(0),
      };
    case 'sharpening':
      return {
        value: film.sharpening,
        minValue: 0,
        maxValue: 1.0,
        onChange: film.setSharpening,
        onUpdateWorklet: filmWorklets.updateSharpening,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setSharpening(0),
      };
    case 'saturation':
      return {
        value: film.saturation,
        minValue: 0,
        maxValue: 2.0,
        centerValue: 1.0,
        onChange: film.setSaturation,
        onUpdateWorklet: filmWorklets.updateSaturation,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setSaturation(1.0),
      };
    case 'contrast':
      return {
        value: film.contrast,
        minValue: 0,
        maxValue: 2.0,
        centerValue: 1.0,
        onChange: film.setContrast,
        onUpdateWorklet: filmWorklets.updateContrast,
        valueFormatter: (v: number) => {
          'worklet';
          const val = Math.round((v - 1) * 100);
          return val > 0 ? `+${val}` : `${val}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setContrast(1.0),
      };
    case 'chromatic_aberration':
      return {
        value: film.chromaticAberration,
        minValue: 0.0,
        maxValue: 2.0,
        onChange: film.setChromaticAberration,
        onUpdateWorklet: filmWorklets.updateChromaticAberration,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setChromaticAberration(0.0),
      };
    case 'bloom':
      return {
        value: film.bloomIntensity,
        minValue: 0.0,
        maxValue: 1.0,
        onChange: film.setBloomIntensity,
        onUpdateWorklet: filmWorklets.updateBloomIntensity,
        valueFormatter: (v: number) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => film.setBloomIntensity(0.0),
      };
    case 'temperature':
      return {
        value: film.temperature,
        minValue: 2000,
        maxValue: 10000,
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
      };
  }
};
