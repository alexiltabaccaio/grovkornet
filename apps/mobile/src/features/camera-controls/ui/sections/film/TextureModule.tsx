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

  const { 
    grainIntensity, setGrainIntensity,
    noiseReductionAuto, setNoiseReductionAuto,
    noiseReductionMode, setNoiseReductionMode,
    sharpening, setSharpening 
  } = useStylesStore(useShallow(s => ({
    grainIntensity: s.grainIntensity,
    setGrainIntensity: s.setGrainIntensity,
    noiseReductionAuto: s.noiseReductionAuto,
    setNoiseReductionAuto: s.setNoiseReductionAuto,
    noiseReductionMode: s.noiseReductionMode,
    setNoiseReductionMode: s.setNoiseReductionMode,
    sharpening: s.sharpening,
    setSharpening: s.setSharpening,
  })));

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
          label={t('parameters.noise_reduction')}
          isActive={activeParameter === 'noise_reduction'}
          onPress={() => handlePressWithDouble('noise_reduction', () => setActiveParameter('noise_reduction'))}
          value={noiseReductionMode}
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
          onPress={() => handlePressWithDouble('sharpening', () => setActiveParameter('sharpening'))}
          value={sharpening}
          minValue={0}
          maxValue={1}
          onChange={setSharpening}
          icon="sparkles-outline"
          variant="text"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          }}
        />
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
            return `${Math.round(v * 100)}`;
          }}
        />
      </View>
    </Animated.View>
  );
};
