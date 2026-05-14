import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { FooterParameterControl } from '../FooterParameterControl';
import { footerStyles } from '../Footer.styles';

interface GrainModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  grainIntensity: SharedValue<number>;
  setGrainIntensity: (value: number) => void;
  grainChroma: SharedValue<number>;
  setGrainChroma: (value: number) => void;
  grainSize: SharedValue<number>;
  setGrainSize: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const GrainModule = ({
  activeParameter,
  setActiveParameter,
  grainIntensity,
  setGrainIntensity,
  grainChroma,
  setGrainChroma,
  grainSize,
  setGrainSize,
  handlePressWithDouble,
}: GrainModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <FooterParameterControl
        label={t('parameters.amount')}
        isActive={activeParameter === 'grain'}
        onPress={() => handlePressWithDouble('grain', () => setActiveParameter('grain'))}
        value={grainIntensity}
        maxValue={1.0}
        onChange={setGrainIntensity}
        icon="water-outline"
      />
      <FooterParameterControl
        label={t('parameters.chroma')}
        isActive={activeParameter === 'grain_chroma'}
        onPress={() => {
          setGrainChroma(grainChroma.value === 0 ? 1 : 0);
          setActiveParameter('grain_chroma');
        }}
        value={grainChroma}
        renderValue={true}
        variant="text"
        valueFormatter={(v) => {
          'worklet';
          return v === 0 ? 'MONO' : 'RGB';
        }}
      />
      <FooterParameterControl
        label={t('parameters.size')}
        isActive={activeParameter === 'grain_size'}
        onPress={() => handlePressWithDouble('grain_size', () => setActiveParameter('grain_size'))}
        value={grainSize}
        minValue={1.0}
        maxValue={4.0}
        onChange={setGrainSize}
        renderValue={true}
        valueFormatter={(v) => {
          'worklet';
          return `${v.toFixed(1)}x`;
        }}
        variant="text"
      />
      </View>
    </Animated.View>
  );
};
