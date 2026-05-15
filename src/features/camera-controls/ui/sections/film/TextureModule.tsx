import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

interface TextureModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  grainIntensity: SharedValue<number>;
  setGrainIntensity: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TextureModule = ({
  activeParameter,
  setActiveParameter,
  grainIntensity,
  setGrainIntensity,
  handlePressWithDouble,
}: TextureModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
        label={t('parameters.grain')}
        isActive={activeParameter === 'grain'}
        onPress={() => handlePressWithDouble('grain', () => setActiveParameter('grain'))}
        value={grainIntensity}
        maxValue={1.0}
        onChange={setGrainIntensity}
        renderValue={true}
        variant="text"
        valueFormatter={(v) => {
          'worklet';
          return `${Math.round(v * 100)}%`;
        }}
      />
      </View>
    </Animated.View>
  );
};

