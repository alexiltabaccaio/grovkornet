import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const formatTemperature = (v: number) => {
  'worklet';
  return `${Math.round(v)}K`;
};

interface TemperatureParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TemperatureParam = ({ handlePressWithDouble }: TemperatureParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { temperature, setTemperature, temperatureAuto } = useHardwareStore(useShallow(s => ({
    temperature: s.temperature,
    setTemperature: s.setTemperature,
    temperatureAuto: s.temperatureAuto,
  })));

  return (
    <ParameterControl
      label={t('parameters.temperature')}
      isActive={activeParameter === 'temperature'}
      onPress={() => handlePressWithDouble('temperature', () => setActiveParameter('temperature'))}
      value={temperature}
      minValue={2000}
      maxValue={10000}
      onChange={setTemperature}
      variant="text"
      isAuto={temperatureAuto}
      valueFormatter={formatTemperature}
      hideValueInAuto={true}
      autoValueText="AWB"
    />
  );
};
