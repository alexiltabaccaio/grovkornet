import { useShallow } from 'zustand/react/shallow';
import { useDerivedValue } from 'react-native-reanimated';
import { useBodyStore } from '../model/useBodyStore';
import { useBodyWorklets } from './useBodyWorklets';
import { ParameterControlData } from '@shared/lib/parameter/types';

export type BodyParameterType = 'ev' | 'iso' | 'shutter_speed';

export const useBodyParameterControlData = (
  parameter: BodyParameterType
): ParameterControlData => {
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

  const isEvDisabled = useDerivedValue(() => {
    return !body.isoAuto.value && !body.shutterSpeedAuto.value;
  });

  const bodyWorklets = useBodyWorklets();

  switch (parameter) {
    case 'ev':
      return {
        value: body.ev,
        minValue: -2.0,
        maxValue: 2.0,
        centerValue: 0.0,
        onChange: body.setEv,
        onUpdateWorklet: bodyWorklets.updateEv,
        valueFormatter: (v: number) => {
          'worklet';
          return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
        },
        hideValueInAuto: false,
        autoValueText: 'AUTO',
        onReset: () => body.setEv(0),
        disabled: isEvDisabled,
      };
    case 'iso':
      return {
        value: body.iso,
        minValue: body.capabilities.isoMin ?? 50,
        maxValue: body.capabilities.isoMax ?? 3200,
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
      };
    case 'shutter_speed':
      return {
        value: body.shutterSpeed,
        minValue: 1,
        maxValue: 1000,
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
      };
  }
};
