import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface SharpeningParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const SharpeningParam = ({ handlePressWithDouble }: SharpeningParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { sharpening, setSharpening } = useStylesStore(useShallow(s => ({
    sharpening: s.sharpening,
    setSharpening: s.setSharpening,
  })));

  return (
    <ParameterControl
      label={t('parameters.sharpening')}
      isActive={activeParameter === 'sharpening'}
      onPress={() => handlePressWithDouble('sharpening', () => setActiveParameter('sharpening'))}
      value={sharpening}
      minValue={0}
      maxValue={1}
      onChange={setSharpening}
      icon="sparkles-outline"
      variant="text"
      renderValue={true}
      valueFormatter={(v) => {
        'worklet';
        return `${Math.round(v * 100)}`;
      }}
    />
  );
};
