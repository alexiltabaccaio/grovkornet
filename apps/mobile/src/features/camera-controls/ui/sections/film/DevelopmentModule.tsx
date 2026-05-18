import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../../model/useUIStore';
import { useStylesStore } from '../../../model/useStylesStore';
import { useHardwareStore } from '../../../model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';

const formatTemperature = (v: number) => {
  'worklet';
  return `${Math.round(v)}K`;
};

interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DevelopmentModule = ({ handlePressWithDouble }: DevelopmentModuleProps) => {
  const { t } = useTranslation();

  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const { 
    saturation, setSaturation, 
    contrast, setContrast, 
  } = useStylesStore(useShallow(s => ({
    saturation: s.saturation,
    setSaturation: s.setSaturation,
    contrast: s.contrast,
    setContrast: s.setContrast,
  })));

  const { temperature, setTemperature, temperatureAuto, setTemperatureAuto } = useHardwareStore(useShallow(s => ({
    temperature: s.temperature,
    setTemperature: s.setTemperature,
    temperatureAuto: s.temperatureAuto,
    setTemperatureAuto: s.setTemperatureAuto,
  })));



  return (
    <Animated.View style={footerStyles.tabContent}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={footerStyles.scrollContainer}
      >
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
          valueFormatter={formatTemperature}
          hideValueInAuto={true}
          autoValueText="AWB"
        />
        <ParameterControl
          label={t('parameters.contrast')}
          isActive={activeParameter === 'contrast'}
          onPress={() => handlePressWithDouble('contrast', () => setActiveParameter('contrast'))}
          value={contrast}
          maxValue={2.0}
          onChange={setContrast}
          icon="contrast-outline"
          variant="text"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : `${val}`;
          }}
        />
        <ParameterControl
          label={t('parameters.saturation')}
          isActive={activeParameter === 'saturation'}
          onPress={() => handlePressWithDouble('saturation', () => setActiveParameter('saturation'))}
          value={saturation}
          maxValue={2.0}
          onChange={setSaturation}
          icon="color-filter-outline"
          variant="text"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : `${val}`;
          }}
        />
      </ScrollView>
    </Animated.View>
  );
};
