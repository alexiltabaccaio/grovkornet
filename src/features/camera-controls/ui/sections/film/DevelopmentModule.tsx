import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

const formatTemperature = (v: number) => {
  'worklet';
  return `${Math.round(v)}K`;
};

interface DevelopmentModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  saturation: SharedValue<number>;
  setSaturation: (value: number) => void;
  contrast: SharedValue<number>;
  setContrast: (value: number) => void;
  temperature: SharedValue<number>;
  setTemperature: (value: number) => void;
  temperatureAuto: SharedValue<boolean>;
  setTemperatureAuto: (value: boolean) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DevelopmentModule = ({
  activeParameter,
  setActiveParameter,
  saturation,
  setSaturation,
  contrast,
  setContrast,
  temperature,
  setTemperature,
  temperatureAuto,
  setTemperatureAuto,
  handlePressWithDouble,
}: DevelopmentModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
          label={t('parameters.saturation')}
          isActive={activeParameter === 'saturation'}
          onPress={() => handlePressWithDouble('saturation', () => setActiveParameter('saturation'))}
          value={saturation}
          maxValue={2.0}
          onChange={setSaturation}
          icon="color-filter-outline"
        />
        <ParameterControl
          label={t('parameters.contrast')}
          isActive={activeParameter === 'contrast'}
          onPress={() => handlePressWithDouble('contrast', () => setActiveParameter('contrast'))}
          value={contrast}
          maxValue={2.0}
          onChange={setContrast}
          icon="contrast-outline"
        />
        <ParameterControl
          label={t('parameters.temperature')}
          isActive={activeParameter === 'temperature'}
          onPress={() => handlePressWithDouble('temperature', () => setActiveParameter('temperature'))}
          value={temperature}
          minValue={2000}
          maxValue={10000}
          onChange={setTemperature}
          variant="text"
          isAuto={temperatureAuto}
          onLongPress={() => setTemperatureAuto(!temperatureAuto.value)}
          valueFormatter={formatTemperature}
          hideValueInAuto={true}
        />
      </View>
    </Animated.View>
  );
};
