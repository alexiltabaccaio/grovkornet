import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { PrimaryParameterType } from '@shared/types/camera';
import { PrimaryParameterControl } from '../PrimaryParameterControl';
import { footerStyles } from '../Footer.styles';

interface LensEffectsModuleProps {
  activePrimaryParameter: PrimaryParameterType;
  setActivePrimaryParameter: (param: PrimaryParameterType) => void;
  chromaticAberration: SharedValue<number>;
  setChromaticAberration: (value: number) => void;
  handlePressWithDouble: (param: PrimaryParameterType, action: () => void) => void;
}

export const LensEffectsModule = ({
  activePrimaryParameter,
  setActivePrimaryParameter,
  chromaticAberration,
  setChromaticAberration,
  handlePressWithDouble,
}: LensEffectsModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <PrimaryParameterControl
        label={t('parameters.phase_shift')}
        isActive={activePrimaryParameter === 'chromatic_aberration'}
        onPress={() => handlePressWithDouble('chromatic_aberration', () => setActivePrimaryParameter('chromatic_aberration'))}
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
