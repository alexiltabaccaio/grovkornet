import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { LanguageThumb } from '@shared/ui';
import { footerStyles } from '../Footer.styles';

export const LanguageModule = () => {
  const { i18n } = useTranslation();

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
      </View>
    </Animated.View>
  );
};
