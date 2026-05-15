import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { PrimaryParameterType } from '@shared/types/camera';
import { PrimaryParameterControl } from '../PrimaryParameterControl';
import { footerStyles } from '../Footer.styles';

interface GrainModuleProps {
  activePrimaryParameter: PrimaryParameterType;
  setActivePrimaryParameter: (param: PrimaryParameterType) => void;
  grainIntensity: SharedValue<number>;
  setGrainIntensity: (value: number) => void;
  grainChroma: SharedValue<number>;
  setGrainChroma: (value: number) => void;
  grainSize: SharedValue<number>;
  setGrainSize: (value: number) => void;
  handlePressWithDouble: (param: PrimaryParameterType, action: () => void) => void;
}

export const GrainModule = ({
  activePrimaryParameter,
  setActivePrimaryParameter,
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
        <PrimaryParameterControl
        label={t('parameters.amount')}
        isActive={activePrimaryParameter === 'grain'}
        onPress={() => handlePressWithDouble('grain', () => setActivePrimaryParameter('grain'))}
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
      <PrimaryParameterControl
        label={t('parameters.chroma')}
        isActive={activePrimaryParameter === 'grain_chroma'}
        onPress={() => {
          setGrainChroma(grainChroma.value === 0 ? 1 : 0);
          setActivePrimaryParameter('grain_chroma');
        }}
        value={grainChroma}
        renderValue={true}
        variant="text"
        valueFormatter={(v) => {
          'worklet';
          return v === 0 ? 'MONO' : 'RGB';
        }}
      />
      <PrimaryParameterControl
        label={t('parameters.size')}
        isActive={activePrimaryParameter === 'grain_size'}
        onPress={() => handlePressWithDouble('grain_size', () => setActivePrimaryParameter('grain_size'))}
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
