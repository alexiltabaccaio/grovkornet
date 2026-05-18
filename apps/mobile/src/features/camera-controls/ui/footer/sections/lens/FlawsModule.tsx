import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { VignetteParam } from './flaws/vignette/VignetteParam';
import { AberrationParam } from './flaws/aberration/AberrationParam';

interface FlawsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FlawsModule = ({ handlePressWithDouble }: FlawsModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <VignetteParam />
        <AberrationParam handlePressWithDouble={handlePressWithDouble} />
      </View>
    </Animated.View>
  );
};
