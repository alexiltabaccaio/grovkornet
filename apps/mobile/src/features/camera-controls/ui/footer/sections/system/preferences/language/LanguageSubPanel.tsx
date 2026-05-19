import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, ImageSourcePropType, View } from 'react-native';
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

  const { activeSubParameter, setActiveSubParameter, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
    isDebugEnabled: state.isDebugEnabled,
  })));

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.parameterExtensionContainer, 
          animatedStyle,
        ]}
      >
        <View style={[
          styles.debugWrapper,
          isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
        ]}>
          <View style={styles.buttonRow}>
            <ParameterControl
              label=""
              isActive={activeSubParameter === 'lang_en' || i18n.language.startsWith('en')}
              hideDebugRectangles={true}
              onPress={() => {
                setActiveSubParameter('lang_en');
                void i18n.changeLanguage('en').catch(error => {
                  console.error('Failed to change language to en:', error);
                });
              }}
              imageSource={enFlag}
            />
            <ParameterControl
              label=""
              isActive={activeSubParameter === 'lang_it' || i18n.language.startsWith('it')}
              hideDebugRectangles={true}
              onPress={() => {
                setActiveSubParameter('lang_it');
                void i18n.changeLanguage('it').catch(error => {
                  console.error('Failed to change language to it:', error);
                });
              }}
              imageSource={itFlag}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
  },
  debugWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
});
