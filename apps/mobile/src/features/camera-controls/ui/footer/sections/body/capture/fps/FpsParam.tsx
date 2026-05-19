import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface FpsParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FpsParam = ({ handlePressWithDouble }: FpsParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <ParameterControl
      label={t('parameters.fps_setting')}
      isActive={activeParameter === 'fps_setting'}
      onPress={() => handlePressWithDouble('fps_setting', () => {
        setActiveParameter(activeParameter === 'fps_setting' ? 'none' : 'fps_setting');
      })}
      variant="text"
    />
  );
};
