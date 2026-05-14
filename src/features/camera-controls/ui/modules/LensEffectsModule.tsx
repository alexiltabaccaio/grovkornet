import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { FooterParameterControl } from '../FooterParameterControl';
import { footerStyles } from '../Footer.styles';

interface LensEffectsModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  chromaticAberration: SharedValue<number>;
  setChromaticAberration: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LensEffectsModule = ({
  activeParameter,
  setActiveParameter,
  chromaticAberration,
  setChromaticAberration,
  handlePressWithDouble,
}: LensEffectsModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <FooterParameterControl
        label={t('parameters.phase_shift')}
        isActive={activeParameter === 'chromatic_aberration'}
        onPress={() => handlePressWithDouble('chromatic_aberration', () => setActiveParameter('chromatic_aberration'))}
        value={chromaticAberration}
        maxValue={2.0}
        onChange={setChromaticAberration}
        renderValue={true}
        variant="text"
        valueFormatter={(v) => {
          'worklet';
          return `${v.toFixed(1)}%`;
        }}
      />
    </Animated.View>
  );
};
