import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const enFlag = require('../../../../../../../../../assets/flags/en.png') as ImageSourcePropType;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itFlag = require('../../../../../../../../../assets/flags/it.png') as ImageSourcePropType;

interface LanguageSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
}

export const LanguageSubPanel = ({ animatedStyle }: LanguageSubPanelProps) => {
  const { i18n } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ParameterControl
        label="English"
        isActive={activeSubParameter === 'lang_en' || i18n.language.startsWith('en')}
        onPress={() => {
          setActiveSubParameter('lang_en');
          void i18n.changeLanguage('en').catch(error => {
            console.error('Failed to change language to en:', error);
          });
        }}
        imageSource={enFlag}
      />
      <ParameterControl
        label="Italiano"
        isActive={activeSubParameter === 'lang_it' || i18n.language.startsWith('it')}
        onPress={() => {
          setActiveSubParameter('lang_it');
          void i18n.changeLanguage('it').catch(error => {
            console.error('Failed to change language to it:', error);
          });
        }}
        imageSource={itFlag}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
});
