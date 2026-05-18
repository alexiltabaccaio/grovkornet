import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface GrainParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const GrainParam = ({ handlePressWithDouble }: GrainParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { grainIntensity, setGrainIntensity } = useStylesStore(useShallow(s => ({
    grainIntensity: s.grainIntensity,
    setGrainIntensity: s.setGrainIntensity,
  })));

  return (
    <ParameterControl
      label={t('parameters.grain')}
      isActive={activeParameter === 'grain'}
      onPress={() => handlePressWithDouble('grain', () => setActiveParameter('grain'))}
      value={grainIntensity}
      maxValue={1.0}
      onChange={setGrainIntensity}
      renderValue={true}
      variant="text"
      valueFormatter={(v) => {
        'worklet';
        return `${Math.round(v * 100)}`;
      }}
    />
  );
};
