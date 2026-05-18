import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface IsoParamProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const IsoParam = ({ handlePressWithDouble }: IsoParamProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { iso, setIso, isoAuto } = useHardwareStore(useShallow(s => ({
    iso: s.iso,
    setIso: s.setIso,
    isoAuto: s.isoAuto,
  })));

  return (
    <ParameterControl
      label={t('parameters.iso')}
      isActive={activeParameter === 'iso'}
      onPress={() => handlePressWithDouble('iso', () => setActiveParameter('iso'))}
      value={iso}
      minValue={50}
      maxValue={3200}
      onChange={setIso}
      variant="text"
      isAuto={isoAuto}
    />
  );
};
