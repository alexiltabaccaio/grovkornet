import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface ContrastParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ContrastParam = ({ handlePressWithDouble }: ContrastParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { contrast, setContrast } = useStylesStore(useShallow(s => ({
    contrast: s.contrast,
    setContrast: s.setContrast,
  })));

  return (
    <ParameterControl
      label={t('parameters.contrast')}
      isActive={activeParameter === 'contrast'}
      onPress={() => handlePressWithDouble('contrast', () => setActiveParameter('contrast'))}
      value={contrast}
      maxValue={2.0}
      onChange={setContrast}
      icon="contrast-outline"
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
