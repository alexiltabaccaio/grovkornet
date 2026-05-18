import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { LensSelectionParam } from './optics/lens-selection/LensSelectionParam';
import { FocusParam } from './optics/focus/FocusParam';

interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = ({ handlePressWithDouble }: OpticsModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <LensSelectionParam handlePressWithDouble={handlePressWithDouble} />
        <FocusParam handlePressWithDouble={handlePressWithDouble} />
      </View>
    </Animated.View>
  );
};
