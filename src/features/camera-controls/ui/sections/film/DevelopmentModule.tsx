import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useDerivedValue } from 'react-native-reanimated';
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
  noiseReductionAuto: SharedValue<boolean>;
  setNoiseReductionAuto: (value: boolean) => void;
  noiseReductionMode: SharedValue<number>;
  setNoiseReductionMode: (value: number) => void;
  sharpening: SharedValue<number>;
  setSharpening: (value: number) => void;
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
  noiseReductionAuto,
  setNoiseReductionAuto,
  noiseReductionMode,
  setNoiseReductionMode,
  sharpening,
  setSharpening,
  handlePressWithDouble,
}: DevelopmentModuleProps) => {
  const { t } = useTranslation();

  const noiseReductionNum = useDerivedValue(() => {
    return noiseReductionMode.value;
  });

  return (
    <Animated.View style={footerStyles.tabContent}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={footerStyles.scrollContainer}
      >
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
          autoValueText="AWB"
        />
        <ParameterControl
          label={t('parameters.noise_reduction')}
          isActive={activeParameter === 'noise_reduction'}
          onPress={() => handlePressWithDouble('noise_reduction', () => setActiveParameter('noise_reduction'))}
          value={noiseReductionNum}
          minValue={0}
          maxValue={2}
          onChange={(v) => {
            const rounded = Math.round(v);
            setNoiseReductionMode(rounded);
          }}
          isAuto={noiseReductionAuto}
          onLongPress={() => setNoiseReductionAuto(true)}
          variant="text"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            const mode = Math.round(v);
            if (mode === 0) return 'OFF';
            if (mode === 1) return 'FAST';
            if (mode === 2) return 'HQ';
            return 'OFF';
          }}
        />
        <ParameterControl
          label={t('parameters.sharpening')}
          isActive={activeParameter === 'sharpening'}
          onPress={() => setActiveParameter('sharpening')}
          value={sharpening}
          minValue={0}
          maxValue={1}
          onChange={setSharpening}
          icon="sparkles-outline"
          valueFormatter={(v) => {
            'worklet';
            return `${Math.round(v * 100)}%`;
          }}
        />
      </ScrollView>
    </Animated.View>
  );
};
