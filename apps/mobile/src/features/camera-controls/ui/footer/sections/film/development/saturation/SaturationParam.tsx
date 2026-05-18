import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface SaturationParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const SaturationParam = ({ handlePressWithDouble }: SaturationParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { saturation, setSaturation } = useStylesStore(useShallow(s => ({
    saturation: s.saturation,
    setSaturation: s.setSaturation,
  })));

  return (
    <ParameterControl
      label={t('parameters.saturation')}
      isActive={activeParameter === 'saturation'}
      onPress={() => handlePressWithDouble('saturation', () => setActiveParameter('saturation'))}
      value={saturation}
      maxValue={2.0}
      onChange={setSaturation}
      icon="color-filter-outline"
      variant="text"
      renderValue={true}
      valueFormatter={(v) => {
        'worklet';
        const val = Math.round((v - 1) * 100);
        return val > 0 ? `+${val}` : `${val}`;
      }}
    />
  );
};
