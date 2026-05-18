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

  const { noiseReductionMode, setNoiseReductionMode, noiseReductionAuto } = useStylesStore(useShallow(s => ({
    noiseReductionMode: s.noiseReductionMode,
    setNoiseReductionMode: s.setNoiseReductionMode,
    noiseReductionAuto: s.noiseReductionAuto,
  })));

  return (
    <ParameterControl
      label={t('parameters.noise_reduction')}
      isActive={activeParameter === 'noise_reduction'}
      onPress={() => handlePressWithDouble('noise_reduction', () => setActiveParameter('noise_reduction'))}
      value={noiseReductionMode}
      minValue={0}
      maxValue={2}
      onChange={(v) => {
        const rounded = Math.round(v);
        setNoiseReductionMode(rounded);
      }}
      isAuto={noiseReductionAuto}
      variant="text"
      renderValue={true}
      valueFormatter={(v) => {
        'worklet';
        const mode = Math.round(v);
        if (mode === 0) return 'OFF';
        if (mode === 1) return 'FAST';
        if (mode === 2) return 'HQ';
        return 'OFF';
      }}
    />
  );
};
