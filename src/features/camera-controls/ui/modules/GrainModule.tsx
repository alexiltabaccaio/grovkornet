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
  handlePressWithDouble: (param: PrimaryParameterType, action: () => void) => void;
}

export const GrainModule = ({
  activePrimaryParameter,
  setActivePrimaryParameter,
  grainIntensity,
  setGrainIntensity,
  handlePressWithDouble,
}: GrainModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <PrimaryParameterControl
        label={t('parameters.grain')}
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
      </View>
    </Animated.View>
  );
};

