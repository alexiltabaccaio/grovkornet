import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SharedValue } from 'react-native-reanimated';
import { PrimaryParameterType } from '@shared/types/camera';
import { PrimaryParameterControl } from '../PrimaryParameterControl';
import { footerStyles } from '../Footer.styles';

const formatTemperature = (v: number) => {
  'worklet';
  return `${Math.round(v)}K`;
};

interface ColorGradingModuleProps {
  activePrimaryParameter: PrimaryParameterType;
  setActivePrimaryParameter: (param: PrimaryParameterType) => void;
  saturation: SharedValue<number>;
  setSaturation: (value: number) => void;
  contrast: SharedValue<number>;
  setContrast: (value: number) => void;
  temperature: SharedValue<number>;
  setTemperature: (value: number) => void;
  temperatureAuto: SharedValue<boolean>;
  setTemperatureAuto: (value: boolean) => void;
  handlePressWithDouble: (param: PrimaryParameterType, action: () => void) => void;
}

export const ColorGradingModule = ({
  activePrimaryParameter,
  setActivePrimaryParameter,
  saturation,
  setSaturation,
  contrast,
  setContrast,
  temperature,
  setTemperature,
  temperatureAuto,
  setTemperatureAuto,
  handlePressWithDouble,
}: ColorGradingModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <PrimaryParameterControl
          label={t('parameters.saturation')}
          isActive={activePrimaryParameter === 'saturation'}
          onPress={() => handlePressWithDouble('saturation', () => setActivePrimaryParameter('saturation'))}
          value={saturation}
          maxValue={2.0}
          onChange={setSaturation}
          icon="color-filter-outline"
        />
        <PrimaryParameterControl
          label={t('parameters.contrast')}
          isActive={activePrimaryParameter === 'contrast'}
          onPress={() => handlePressWithDouble('contrast', () => setActivePrimaryParameter('contrast'))}
          value={contrast}
          maxValue={2.0}
          onChange={setContrast}
          icon="contrast-outline"
        />
        <PrimaryParameterControl
          label={t('parameters.temperature')}
          isActive={activePrimaryParameter === 'temperature'}
          onPress={() => handlePressWithDouble('temperature', () => setActivePrimaryParameter('temperature'))}
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
