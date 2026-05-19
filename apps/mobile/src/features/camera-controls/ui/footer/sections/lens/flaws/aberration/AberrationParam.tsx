import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface AberrationParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const AberrationParam = ({ handlePressWithDouble }: AberrationParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <ParameterControl
      label={t('parameters.chromatic_aberration')}
      isActive={activeParameter === 'chromatic_aberration'}
      onPress={() => handlePressWithDouble('chromatic_aberration', () => {
        setActiveParameter(activeParameter === 'chromatic_aberration' ? 'none' : 'chromatic_aberration');
      })}
      variant="text"
    />
  );
};
