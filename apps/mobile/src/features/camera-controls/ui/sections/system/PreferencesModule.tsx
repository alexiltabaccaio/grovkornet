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
  
  const { isDebugEnabled, setIsDebugEnabled } = useUIStore(useShallow(s => ({
    isDebugEnabled: s.isDebugEnabled,
    setIsDebugEnabled: s.setIsDebugEnabled,
  })));

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
          label="English"
          isActive={i18n.language === 'en' || i18n.language.startsWith('en')}
          onPress={() => {
            void i18n.changeLanguage('en').catch(error => {
              console.error('Failed to change language to en:', error);
            });
          }}
          imageSource={enFlag}
        />
        <ParameterControl
          label="Italiano"
          isActive={i18n.language === 'it' || i18n.language.startsWith('it')}
          onPress={() => {
            void i18n.changeLanguage('it').catch(error => {
              console.error('Failed to change language to it:', error);
            });
          }}
          imageSource={itFlag}
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
