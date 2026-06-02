import React from 'react';
import { StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ParameterControl, ParameterPanelWrapper } from '@entities/system';
import { usePreferencesStore } from '@entities/preferences';

import { logger } from '@shared/lib/logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const enFlag = require('../../../../../../assets/flags/en.png') as ImageSourcePropType;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itFlag = require('../../../../../../assets/flags/it.png') as ImageSourcePropType;

interface LanguagePanelProps {
  animatedStyle: StyleProp<ViewStyle>;
}

export const LanguagePanel = ({ animatedStyle }: LanguagePanelProps) => {
  const { i18n } = useTranslation();

  const { activeDetailPanel, setActiveDetailPanel } = useSystemStore(useShallow(state => ({
    activeDetailPanel: state.activeDetailPanel,
    setActiveDetailPanel: state.setActiveDetailPanel,
  })));

  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={40}>
      <ParameterControl
        label=""
        isActive={activeDetailPanel === 'lang_en' || i18n.language.startsWith('en')}
        hideDebugRectangles={true}
        onPress={() => {
          setActiveDetailPanel('lang_en');
          usePreferencesStore.getState().setLanguagePref('en');
          void i18n.changeLanguage('en').catch(error => {
            logger.error('LanguagePanel', 'Failed to change language to en', error);
          });
        }}
        imageSource={enFlag}
      />
      <ParameterControl
        label=""
        isActive={activeDetailPanel === 'lang_it' || i18n.language.startsWith('it')}
        hideDebugRectangles={true}
        onPress={() => {
          setActiveDetailPanel('lang_it');
          usePreferencesStore.getState().setLanguagePref('it');
          void i18n.changeLanguage('it').catch(error => {
            logger.error('LanguagePanel', 'Failed to change language to it', error);
          });
        }}
        imageSource={itFlag}
      />
    </ParameterPanelWrapper>
  );
};

