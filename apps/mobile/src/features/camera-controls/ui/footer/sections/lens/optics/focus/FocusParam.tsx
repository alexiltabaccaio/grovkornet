import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const formatFocus = (v: number) => {
  'worklet';
  if (v <= 0.1) return '∞';
  
  const distanceInMeters = 1 / v;
  if (distanceInMeters >= 1) {
    return `${distanceInMeters.toFixed(1)}m`;
  } else {
    return `${((distanceInMeters * 100)).toFixed(0)}cm`;
  }
};

interface FocusParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FocusParam = ({ handlePressWithDouble }: FocusParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { focusDistance, setFocusDistance, focusAuto } = useHardwareStore(useShallow(s => ({
    focusDistance: s.focusDistance,
    setFocusDistance: s.setFocusDistance,
    focusAuto: s.focusAuto,
  })));

  return (
    <ParameterControl
      label={t('parameters.focus')}
      isActive={activeParameter === 'focus'}
      onPress={() => handlePressWithDouble('focus', () => setActiveParameter('focus'))}
      value={focusDistance}
      minValue={0}
      maxValue={10}
      onChange={setFocusDistance}
      variant="text"
      isAuto={focusAuto}
      valueFormatter={formatFocus}
      invertDrag={true}
    />
  );
};
