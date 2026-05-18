import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface TorchParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TorchParam = ({ handlePressWithDouble }: TorchParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { capabilities, torchState, setTorchState } = useHardwareStore(useShallow(s => ({
    capabilities: s.capabilities,
    torchState: s.torchState,
    setTorchState: s.setTorchState,
  })));

  if (!capabilities.hasTorch) return null;

  return (
    <ParameterControl
      label={t('parameters.torch')}
      isActive={activeParameter === 'torch'}
      onPress={() => handlePressWithDouble('torch', () => {
        setTorchState(torchState.value === 0 ? 1 : 0);
        setActiveParameter('torch');
      })}
      value={torchState}
      variant="text"
      renderValue={true}
      valueFormatter={(v) => {
        'worklet';
        return v === 0 ? 'OFF' : 'ON';
      }}
    />
  );
};
