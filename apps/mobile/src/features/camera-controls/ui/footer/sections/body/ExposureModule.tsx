import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { IsoParam } from './exposure/iso/IsoParam';
import { ShutterSpeedParam } from './exposure/shutter-speed/ShutterSpeedParam';
import { EvParam } from './exposure/ev/EvParam';

interface ExposureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ExposureModule = ({ handlePressWithDouble }: ExposureModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <IsoParam handlePressWithDouble={handlePressWithDouble} />
        <ShutterSpeedParam handlePressWithDouble={handlePressWithDouble} />
        <EvParam handlePressWithDouble={handlePressWithDouble} />
      </View>
    </Animated.View>
  );
};
