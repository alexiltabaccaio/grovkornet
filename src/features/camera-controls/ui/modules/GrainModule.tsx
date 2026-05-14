import React from 'react';
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
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const GrainModule = ({
  activeParameter,
  setActiveParameter,
  grainIntensity,
  setGrainIntensity,
  handlePressWithDouble,
}: GrainModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <FooterParameterControl
        label={t('parameters.amount')}
        isActive={activeParameter === 'grain'}
        onPress={() => handlePressWithDouble('grain', () => setActiveParameter('grain'))}
        value={grainIntensity}
        maxValue={1.0}
        onChange={setGrainIntensity}
        icon="water-outline"
      />
    </Animated.View>
  );
};
