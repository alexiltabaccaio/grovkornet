import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

interface AspectRatioParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const AspectRatioParam = ({ handlePressWithDouble }: AspectRatioParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <ParameterControl
      label={t('parameters.aspect_ratio')}
      isActive={activeParameter === 'aspect_ratio'}
      onPress={() => handlePressWithDouble('aspect_ratio', () => {
        setActiveParameter(activeParameter === 'aspect_ratio' ? 'none' : 'aspect_ratio');
      })}
      variant="text"
    />
  );
};
