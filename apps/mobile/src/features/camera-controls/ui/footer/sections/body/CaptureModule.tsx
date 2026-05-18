import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { AspectRatioParam } from './capture/aspect-ratio/AspectRatioParam';
import { ResolutionParam } from './capture/resolution/ResolutionParam';
import { FpsParam } from './capture/fps/FpsParam';

interface CaptureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const CaptureModule = ({ handlePressWithDouble }: CaptureModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <AspectRatioParam handlePressWithDouble={handlePressWithDouble} />
        <ResolutionParam handlePressWithDouble={handlePressWithDouble} />
        <FpsParam handlePressWithDouble={handlePressWithDouble} />
      </View>
    </Animated.View>
  );
};
