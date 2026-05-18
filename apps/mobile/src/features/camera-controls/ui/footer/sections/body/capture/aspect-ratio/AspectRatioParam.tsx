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

  const { aspectRatio, setAspectRatio } = useHardwareStore(useShallow(s => ({
    aspectRatio: s.aspectRatio,
    setAspectRatio: s.setAspectRatio,
  })));

  return (
    <ParameterControl
      label={t('parameters.aspect_ratio')}
      isActive={activeParameter === 'aspect_ratio'}
      onPress={() => handlePressWithDouble('aspect_ratio', () => setActiveParameter('aspect_ratio'))}
      value={aspectRatio}
      minValue={0}
      maxValue={ASPECT_RATIOS.length - 1}
      onChange={setAspectRatio}
      variant="text"
      valueFormatter={(v) => {
        'worklet';
        const index = Math.round(v);
        if (index === 0) return '4:3';
        if (index === 1) return '16:9';
        if (index === 2) return '1:1';
        if (index === 3) return '3:2';
        return '65:24';
      }}
    />
  );
};
