import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { LanguageThumb, DebugThumb } from '@shared/ui';
import { footerStyles } from '../../Footer.styles';

export const PreferencesModule = () => {
  const { i18n, t } = useTranslation();
  
  const { isDebugEnabled, setIsDebugEnabled } = useUIStore(useShallow(s => ({
    isDebugEnabled: s.isDebugEnabled,
    setIsDebugEnabled: s.setIsDebugEnabled,
  })));

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <LanguageThumb
          label="English"
          languageCode="en"
          isActive={i18n.language === 'en' || i18n.language.startsWith('en')}
          onPress={() => {
            void i18n.changeLanguage('en').catch(error => {
              console.error('Failed to change language to en:', error);
            });
          }}
        />
        <LanguageThumb
          label="Italiano"
          languageCode="it"
          isActive={i18n.language === 'it' || i18n.language.startsWith('it')}
          onPress={() => {
            void i18n.changeLanguage('it').catch(error => {
              console.error('Failed to change language to it:', error);
            });
          }}
        />
        <DebugThumb
          label={t('modules.debug')}
          isActive={isDebugEnabled}
          onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        />
      </View>
    </Animated.View>
  );
};
