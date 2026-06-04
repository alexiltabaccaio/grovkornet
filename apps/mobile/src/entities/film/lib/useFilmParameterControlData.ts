import { useMemo } from 'react';
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
  | 'blackLevel'
  | 'highlights'
  | 'pivot'
  | 'chromatic_aberration'
  | 'bloom'
  | 'temperature'
  | 'tint'
  | 'pixelation'
  | 'vignette'
  | 'chroma_shift'
  | 'tape_jitter'
  | 'scanlines';

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
  | 'contrastAuto'
  | 'setContrastAuto'
  | 'blackLevel'
  | 'setBlackLevel'
  | 'blackLevelAuto'
  | 'setBlackLevelAuto'
  | 'highlights'
  | 'setHighlights'
  | 'highlightsAuto'
  | 'setHighlightsAuto'
  | 'pivot'
  | 'setPivot'
  | 'pivotAuto'
  | 'setPivotAuto'
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
  | 'pixelationFactor'
  | 'setPixelationFactor'
  | 'vignetteIntensity'
  | 'setVignetteIntensity'
  | 'chromaShift'
  | 'setChromaShift'
  | 'tapeJitter'
  | 'setTapeJitter'
  | 'scanlines'
  | 'setScanlines'
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
            contrastAuto: s.contrastAuto,
            setContrastAuto: s.setContrastAuto,
            setPivotAuto: s.setPivotAuto,
          };
        case 'blackLevel':
          return {
            blackLevel: s.blackLevel,
            setBlackLevel: s.setBlackLevel,
            blackLevelAuto: s.blackLevelAuto,
            setBlackLevelAuto: s.setBlackLevelAuto,
          };
        case 'highlights':
          return {
            highlights: s.highlights,
            setHighlights: s.setHighlights,
            highlightsAuto: s.highlightsAuto,
            setHighlightsAuto: s.setHighlightsAuto,
          };
        case 'pivot':
          return {
            pivot: s.pivot,
            setPivot: s.setPivot,
            pivotAuto: s.pivotAuto,
            setPivotAuto: s.setPivotAuto,
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
        case 'pixelation':
          return {
            pixelationFactor: s.pixelationFactor,
            setPixelationFactor: s.setPixelationFactor,
          };
        case 'vignette':
          return {
            vignetteIntensity: s.vignetteIntensity,
            setVignetteIntensity: s.setVignetteIntensity,
          };
        case 'chroma_shift':
          return {
            chromaShift: s.chromaShift,
            setChromaShift: s.setChromaShift,
          };
        case 'tape_jitter':
          return {
            tapeJitter: s.tapeJitter,
            setTapeJitter: s.setTapeJitter,
          };
        case 'scanlines':
          return {
            scanlines: s.scanlines,
            setScanlines: s.setScanlines,
          };
      }
    })
  ) as unknown as SelectedFilmState;

  const filmWorklets = useFilmWorklets();

  return useMemo((): ParameterControlData => {
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
          onReset: () => {
            film.setContrastAuto(true);
            film.setPivotAuto(true);
          },
        };
      case 'blackLevel':
        return {
          value: film.blackLevel,
          minValue: -0.5,
          maxValue: 0.5,
          centerValue: 0.0,
          onChange: film.setBlackLevel,
          onUpdateWorklet: filmWorklets.updateBlackLevel,
          valueFormatter: (v: number) => {
            'worklet';
            // Multiply by 200 so that the internal range [-0.5, 0.5] is shown as [-100, +100]
            const rounded = Math.round(v * 200);
            return rounded > 0 ? `+${rounded}` : `${rounded}`;
          },
        };
      case 'highlights':
        return {
          value: film.highlights,
          minValue: 0.0,
          maxValue: 2.0,
          centerValue: 1.0,
          onChange: film.setHighlights,
          onUpdateWorklet: filmWorklets.updateHighlights,
          valueFormatter: (v: number) => {
            'worklet';
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : `${val}`;
          },
        };
      case 'pivot':
        return {
          value: film.pivot,
          minValue: 0.0,
          maxValue: 1.0,
          centerValue: 0.5,
          onChange: film.setPivot,
          onUpdateWorklet: filmWorklets.updatePivot,
          valueFormatter: (v: number) => {
            'worklet';
            const val = Math.round((v - 0.5) * 200);
            return val > 0 ? `+${val}` : `${val}`;
          },
          onReset: () => {
            film.setPivotAuto(true);
          },
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
      case 'pixelation':
        return {
          value: film.pixelationFactor,
          minValue: 1.0,
          maxValue: 16.0,
          onChange: film.setPixelationFactor,
          onUpdateWorklet: filmWorklets.updatePixelationFactor,
          valueFormatter: (v: number) => {
            'worklet';
            return `${Math.round(v * 10) / 10}x`;
          },
          hideValueInAuto: false,
          autoValueText: 'AUTO',
          onReset: () => film.setPixelationFactor(1.0),
        };
      case 'vignette':
        return {
          value: film.vignetteIntensity,
          minValue: 0.0,
          maxValue: 1.0,
          onChange: film.setVignetteIntensity,
          onUpdateWorklet: filmWorklets.updateVignetteIntensity,
          valueFormatter: (v: number) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          },
          hideValueInAuto: false,
          autoValueText: 'AUTO',
          onReset: () => film.setVignetteIntensity(0.0),
        };
      case 'chroma_shift':
        return {
          value: film.chromaShift,
          minValue: 0.0,
          maxValue: 2.0,
          onChange: film.setChromaShift,
          onUpdateWorklet: filmWorklets.updateChromaShift,
          valueFormatter: (v: number) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          },
          onReset: () => film.setChromaShift(0.0),
        };
      case 'tape_jitter':
        return {
          value: film.tapeJitter,
          minValue: 0.0,
          maxValue: 1.0,
          onChange: film.setTapeJitter,
          onUpdateWorklet: filmWorklets.updateTapeJitter,
          valueFormatter: (v: number) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          },
          onReset: () => film.setTapeJitter(0.0),
        };
      case 'scanlines':
        return {
          value: film.scanlines,
          minValue: 0.0,
          maxValue: 1.0,
          onChange: film.setScanlines,
          onUpdateWorklet: filmWorklets.updateScanlines,
          valueFormatter: (v: number) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          },
          onReset: () => film.setScanlines(0.0),
        };
    }
  }, [parameter, film, filmWorklets]);
};
