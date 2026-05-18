import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

export const DebugParam = () => {
  const { t } = useTranslation();
  
  const { isDebugEnabled, setIsDebugEnabled } = useUIStore(useShallow(s => ({
    isDebugEnabled: s.isDebugEnabled,
    setIsDebugEnabled: s.setIsDebugEnabled,
  })));

  return (
    <ParameterControl
      label={t('modules.debug')}
      isActive={isDebugEnabled}
      onPress={() => setIsDebugEnabled(!isDebugEnabled)}
      variant="text"
      staticText={isDebugEnabled ? 'ON' : 'OFF'}
    />
  );
};
