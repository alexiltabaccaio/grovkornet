import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const formatShutterSpeed = (v: number) => {
  'worklet';
  return `1/${Math.round(v)}`;
};

interface ShutterSpeedParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ShutterSpeedParam = ({ handlePressWithDouble }: ShutterSpeedParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { shutterSpeed, setShutterSpeed, shutterSpeedAuto } = useHardwareStore(useShallow(s => ({
    shutterSpeed: s.shutterSpeed,
    setShutterSpeed: s.setShutterSpeed,
    shutterSpeedAuto: s.shutterSpeedAuto,
  })));

  return (
    <ParameterControl
      label={t('parameters.shutter_speed')}
      isActive={activeParameter === 'shutter_speed'}
      onPress={() => handlePressWithDouble('shutter_speed', () => setActiveParameter('shutter_speed'))}
      value={shutterSpeed}
      minValue={1}
      maxValue={1000}
      onChange={setShutterSpeed}
      variant="text"
      isAuto={shutterSpeedAuto}
      valueFormatter={formatShutterSpeed}
    />
  );
};
