import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { useStylesStore } from '../../../model/useStylesStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TextureModule = ({ handlePressWithDouble }: TextureModuleProps) => {
  const { t } = useTranslation();
  
  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { grainIntensity, setGrainIntensity } = useStylesStore(useShallow(s => ({
    grainIntensity: s.grainIntensity,
    setGrainIntensity: s.setGrainIntensity,
  })));

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
