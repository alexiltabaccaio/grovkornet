import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const formatEv = (v: number) => {
  'worklet';
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
};

interface EvParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const EvParam = ({ handlePressWithDouble }: EvParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { evAuto, isoAuto, shutterSpeedAuto } = useHardwareStore(useShallow(s => ({
    evAuto: s.evAuto,
    isoAuto: s.isoAuto,
    shutterSpeedAuto: s.shutterSpeedAuto,
  })));

  const isEvDisabled = useDerivedValue(() => {
    return !isoAuto.value && !shutterSpeedAuto.value;
  });

  return (
    <ParameterControl
      label={t('parameters.ev')}
      isActive={activeParameter === 'ev'}
      onPress={() => handlePressWithDouble('ev', () => {
        setActiveParameter(activeParameter === 'ev' ? 'none' : 'ev');
      })}
      variant="text"
      disabled={isEvDisabled}
    />
  );
};
