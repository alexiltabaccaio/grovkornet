import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface LensSelectionParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LensSelectionParam = ({ handlePressWithDouble }: LensSelectionParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { capabilities } = useHardwareStore(useShallow(s => ({
    capabilities: s.capabilities,
  })));

  if (capabilities.availableCameras.length === 0) return null;

  return (
    <ParameterControl
      label={t('parameters.lens')}
      isActive={activeParameter === 'camera_selection'}
      onPress={() => handlePressWithDouble('camera_selection', () => {
        setActiveParameter(activeParameter === 'camera_selection' ? 'none' : 'camera_selection');
      })}
      variant="text"
    />
  );
};
