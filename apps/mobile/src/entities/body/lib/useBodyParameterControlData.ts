import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDerivedValue } from 'react-native-reanimated';
import { useBodyStore } from '../model/useBodyStore';
import { useBodyWorklets } from './useBodyWorklets';
import { ParameterControlData } from '@shared/lib/parameter/types';
import { BodyStore } from '../model/types';

export type BodyParameterType = 'ev' | 'iso' | 'shutter_speed' | 'zoom';

type SelectedBodyState = Pick<
  BodyStore,
  | 'ev'
  | 'setEv'
  | 'iso'
  | 'setIso'
  | 'isoAuto'
  | 'setIsoAuto'
  | 'shutterSpeed'
  | 'setShutterSpeed'
  | 'shutterSpeedAuto'
  | 'setShutterSpeedAuto'
  | 'zoom'
  | 'setZoom'
  | 'capabilities'
>;

export const useBodyParameterControlData = (
  parameter: BodyParameterType
): ParameterControlData => {
  const body = useBodyStore(
    useShallow((s) => {
      switch (parameter) {
        case 'ev':
          return {
            ev: s.ev,
            setEv: s.setEv,
            isoAuto: s.isoAuto,
            shutterSpeedAuto: s.shutterSpeedAuto,
          };
        case 'iso':
          return {
            iso: s.iso,
            setIso: s.setIso,
            isoAuto: s.isoAuto,
            setIsoAuto: s.setIsoAuto,
            capabilities: s.capabilities,
          };
        case 'shutter_speed':
          return {
            shutterSpeed: s.shutterSpeed,
            setShutterSpeed: s.setShutterSpeed,
            shutterSpeedAuto: s.shutterSpeedAuto,
            setShutterSpeedAuto: s.setShutterSpeedAuto,
          };
        case 'zoom':
          return {
            zoom: s.zoom,
            setZoom: s.setZoom,
            capabilities: s.capabilities,
          };
      }
    })
  ) as unknown as SelectedBodyState;

  const isEvDisabled = useDerivedValue(() => {
    if (!body.isoAuto || !body.shutterSpeedAuto) return false;
    return !body.isoAuto.value && !body.shutterSpeedAuto.value;
  });

  const bodyWorklets = useBodyWorklets();

  return useMemo((): ParameterControlData => {
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
          hideValueInAuto: false,
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
          hideValueInAuto: false,
          autoValueText: 'AUTO',
          onReset: () => body.setShutterSpeedAuto(true),
          onToggleAuto: body.setShutterSpeedAuto,
        };
      case 'zoom':
        return {
          value: body.zoom,
          minValue: body.capabilities.minZoom ?? 1.0,
          maxValue: body.capabilities.maxZoom ?? 1.0,
          onChange: body.setZoom,
          onUpdateWorklet: bodyWorklets.updateZoom,
          valueFormatter: (v: number) => {
            'worklet';
            return `${v.toFixed(1)}x`;
          },
          hideValueInAuto: false,
          autoValueText: 'AUTO',
          onReset: () => body.setZoom(1.0),
        };
    }
  }, [parameter, body, bodyWorklets, isEvDisabled]);
};
