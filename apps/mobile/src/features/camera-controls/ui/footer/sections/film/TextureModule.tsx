import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { NoiseReductionParam } from './texture/noise-reduction/NoiseReductionParam';
import { SharpeningParam } from './texture/sharpening/SharpeningParam';
import { GrainParam } from './texture/grain/GrainParam';

interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TextureModule = ({ handlePressWithDouble }: TextureModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <GrainParam handlePressWithDouble={handlePressWithDouble} />
        <SharpeningParam handlePressWithDouble={handlePressWithDouble} />
        <NoiseReductionParam handlePressWithDouble={handlePressWithDouble} />
      </View>
    </Animated.View>
  );
};
