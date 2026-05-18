import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { TorchParam } from './lighting/torch/TorchParam';

interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = ({ handlePressWithDouble }: LightingModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <TorchParam handlePressWithDouble={handlePressWithDouble} />
      </View>
    </Animated.View>
  );
};
