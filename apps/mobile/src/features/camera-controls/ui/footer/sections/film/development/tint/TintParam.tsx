import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const formatTint = (v: number) => {
  'worklet';
  const rounded = Math.round(v);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
};

interface TintParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TintParam = ({ handlePressWithDouble }: TintParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { tint, setTint, temperatureAuto } = useHardwareStore(useShallow(s => ({
    tint: s.tint,
    setTint: s.setTint,
    temperatureAuto: s.temperatureAuto,
  })));

  return (
    <ParameterControl
      label={t('parameters.tint')}
      isActive={activeParameter === 'tint'}
      onPress={() => handlePressWithDouble('tint', () => setActiveParameter('tint'))}
      value={tint}
      minValue={-100}
      maxValue={100}
      onChange={setTint}
      variant="text"
      isAuto={temperatureAuto}
      valueFormatter={formatTint}
      hideValueInAuto={true}
      autoValueText="AWB"
    />
  );
};
