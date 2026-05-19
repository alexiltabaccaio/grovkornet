import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface NoiseReductionParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const NoiseReductionParam = ({ handlePressWithDouble }: NoiseReductionParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <ParameterControl
      label={t('parameters.noise_reduction')}
      isActive={activeParameter === 'noise_reduction'}
      onPress={() => handlePressWithDouble('noise_reduction', () => {
        setActiveParameter(activeParameter === 'noise_reduction' ? 'none' : 'noise_reduction');
      })}
      variant="text"
    />
  );
};
