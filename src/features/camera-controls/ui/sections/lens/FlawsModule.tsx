import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

interface FlawsModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  chromaticAberration: SharedValue<number>;
  setChromaticAberration: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FlawsModule = ({
  activeParameter,
  setActiveParameter,
  chromaticAberration,
  setChromaticAberration,
  handlePressWithDouble,
}: FlawsModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <ParameterControl
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
