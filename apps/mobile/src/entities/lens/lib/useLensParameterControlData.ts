import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLensStore } from '../model/useLensStore';
import { useLensWorklets } from './useLensWorklets';
import { ParameterControlData } from '@shared/lib/parameter/types';

export type LensParameterType = 'focus';

export const useLensParameterControlData = (
  parameter: LensParameterType
): ParameterControlData => {
  const lens = useLensStore(
    useShallow((s) => {
      switch (parameter) {
        case 'focus':
          return {
            focusDistance: s.focusDistance,
            setFocusDistance: s.setFocusDistance,
            focusAuto: s.focusAuto,
            setFocusAuto: s.setFocusAuto,
          };
      }
    })
  );

  const lensWorklets = useLensWorklets();

  return useMemo((): ParameterControlData => {
    switch (parameter) {
      case 'focus':
        return {
          value: lens.focusDistance,
          minValue: 0,
          maxValue: 10,
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
        };
    }
  }, [parameter, lens, lensWorklets]);
};
