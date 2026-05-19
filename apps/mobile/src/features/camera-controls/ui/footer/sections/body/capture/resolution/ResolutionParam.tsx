import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

const RESOLUTIONS = ['720p', '1080p', '4K'];

interface ResolutionParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ResolutionParam = ({ handlePressWithDouble }: ResolutionParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <ParameterControl
      label={t('parameters.resolution_setting')}
      isActive={activeParameter === 'resolution_setting'}
      onPress={() => handlePressWithDouble('resolution_setting', () => {
        setActiveParameter(activeParameter === 'resolution_setting' ? 'none' : 'resolution_setting');
      })}
      variant="text"
    />
  );
};
