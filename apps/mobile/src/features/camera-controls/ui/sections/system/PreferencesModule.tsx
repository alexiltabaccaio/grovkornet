import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { footerStyles } from '../../Footer.styles';
import { ParameterControl } from '../../ParameterControl';
import { ImageSourcePropType } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const enFlag = require('../../../../../../assets/flags/en.png') as ImageSourcePropType;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itFlag = require('../../../../../../assets/flags/it.png') as ImageSourcePropType;

export const PreferencesModule = () => {
  const { i18n, t } = useTranslation();
  
  const { isDebugEnabled, setIsDebugEnabled, activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    isDebugEnabled: s.isDebugEnabled,
    setIsDebugEnabled: s.setIsDebugEnabled,
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
          label={t('parameters.language')}
          isActive={activeParameter === 'language'}
          onPress={() => setActiveParameter('language')}
          imageSource={i18n.language.startsWith('it') ? itFlag : enFlag}
        />
        <ParameterControl
          label={t('modules.debug')}
          isActive={isDebugEnabled}
          onPress={() => setIsDebugEnabled(!isDebugEnabled)}
          variant="text"
          staticText={isDebugEnabled ? 'ON' : 'OFF'}
        />
      </View>
    </Animated.View>
  );
};
