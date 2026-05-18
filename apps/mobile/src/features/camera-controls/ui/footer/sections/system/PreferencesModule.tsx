import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { GridParam } from './preferences/grid/GridParam';
import { HistogramParam } from './preferences/histogram/HistogramParam';
import { LanguageParam } from './preferences/language/LanguageParam';
import { DebugParam } from './preferences/debug/DebugParam';

export const PreferencesModule = () => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <GridParam />
        <HistogramParam />
        <LanguageParam />
        <DebugParam />
      </View>
    </Animated.View>
  );
};
