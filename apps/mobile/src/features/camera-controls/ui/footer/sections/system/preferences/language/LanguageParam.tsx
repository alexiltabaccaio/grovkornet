import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';
import { ImageSourcePropType } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const enFlag = require('../../../../../../../../../assets/flags/en.png') as ImageSourcePropType;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itFlag = require('../../../../../../../../../assets/flags/it.png') as ImageSourcePropType;

export const LanguageParam = () => {
  const { i18n, t } = useTranslation();
  
  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <ParameterControl
      label={t('parameters.language')}
      isActive={activeParameter === 'language'}
      onPress={() => setActiveParameter('language')}
      imageSource={i18n.language.startsWith('it') ? itFlag : enFlag}
    />
  );
};
