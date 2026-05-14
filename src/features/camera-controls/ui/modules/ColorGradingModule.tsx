import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { FooterParameterControl } from '../FooterParameterControl';
import { footerStyles } from '../Footer.styles';

interface ColorGradingModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  saturation: SharedValue<number>;
  setSaturation: (value: number) => void;
  contrast: SharedValue<number>;
  setContrast: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ColorGradingModule = ({
  activeParameter,
  setActiveParameter,
  saturation,
  setSaturation,
  contrast,
  setContrast,
  handlePressWithDouble,
}: ColorGradingModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <FooterParameterControl
          label={t('parameters.saturation')}
          isActive={activeParameter === 'saturation'}
          onPress={() => handlePressWithDouble('saturation', () => setActiveParameter('saturation'))}
          value={saturation}
          maxValue={2.0}
          onChange={setSaturation}
          icon="color-filter-outline"
        />
        <FooterParameterControl
          label={t('parameters.contrast')}
          isActive={activeParameter === 'contrast'}
          onPress={() => handlePressWithDouble('contrast', () => setActiveParameter('contrast'))}
          value={contrast}
          maxValue={2.0}
          onChange={setContrast}
          icon="contrast-outline"
        />
      </View>
    </Animated.View>
  );
};
