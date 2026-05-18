import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { TemperatureParam } from './development/temperature/TemperatureParam';
import { TintParam } from './development/tint/TintParam';
import { ContrastParam } from './development/contrast/ContrastParam';
import { SaturationParam } from './development/saturation/SaturationParam';

interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DevelopmentModule = ({ handlePressWithDouble }: DevelopmentModuleProps) => {
  return (
    <Animated.View style={footerStyles.tabContent}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={footerStyles.scrollContainer}
      >
        <SaturationParam handlePressWithDouble={handlePressWithDouble} />
        <ContrastParam handlePressWithDouble={handlePressWithDouble} />
        <TemperatureParam handlePressWithDouble={handlePressWithDouble} />
        <TintParam handlePressWithDouble={handlePressWithDouble} />
      </ScrollView>
    </Animated.View>
  );
};
