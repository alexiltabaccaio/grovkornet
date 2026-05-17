import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { useStylesStore } from '../../../model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

interface FlawsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const FlawsModule = ({ handlePressWithDouble }: FlawsModuleProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { chromaticAberration, setChromaticAberration } = useStylesStore(useShallow(s => ({
    chromaticAberration: s.chromaticAberration,
    setChromaticAberration: s.setChromaticAberration,
  })));

  return (
    <Animated.View style={footerStyles.tabContent}>
      <ParameterControl
        label={t('parameters.chromatic_aberration')}
        isActive={activeParameter === 'chromatic_aberration'}
        onPress={() => handlePressWithDouble('chromatic_aberration', () => setActiveParameter('chromatic_aberration'))}
        value={chromaticAberration}
        maxValue={2.0}
        onChange={setChromaticAberration}
        renderValue={true}
        variant="text"
        valueFormatter={(v) => {
          'worklet';
          return `${Math.round(v * 100)}`;
        }}
      />
    </Animated.View>
  );
};
