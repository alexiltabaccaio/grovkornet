import React from 'react';
import { StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ParameterControl, ParameterExtensionWrapper } from '@entities/system';

import { logger } from '@shared/lib/logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const enFlag = require('../../../../../../assets/flags/en.png') as ImageSourcePropType;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itFlag = require('../../../../../../assets/flags/it.png') as ImageSourcePropType;

interface LanguageExtensionProps {
  animatedStyle: StyleProp<ViewStyle>;
}

export const LanguageExtension = ({ animatedStyle }: LanguageExtensionProps) => {
  const { i18n } = useTranslation();

  const { activeExtension, setActiveExtension } = useSystemStore(useShallow(state => ({
    activeExtension: state.activeExtension,
    setActiveExtension: state.setActiveExtension,
  })));

  return (
    <ParameterExtensionWrapper animatedStyle={animatedStyle} gap={40}>
      <ParameterControl
        label=""
        isActive={activeExtension === 'lang_en' || i18n.language.startsWith('en')}
        hideDebugRectangles={true}
        onPress={() => {
          setActiveExtension('lang_en');
          void i18n.changeLanguage('en').catch(error => {
            logger.error('LanguageExtension', 'Failed to change language to en', error);
          });
        }}
        imageSource={enFlag}
      />
      <ParameterControl
        label=""
        isActive={activeExtension === 'lang_it' || i18n.language.startsWith('it')}
        hideDebugRectangles={true}
        onPress={() => {
          setActiveExtension('lang_it');
          void i18n.changeLanguage('it').catch(error => {
            logger.error('LanguageExtension', 'Failed to change language to it', error);
          });
        }}
        imageSource={itFlag}
      />
    </ParameterExtensionWrapper>
  );
};

