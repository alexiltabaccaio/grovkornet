import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';

import { SliderPanel } from './components/SliderPanel';
import { TorchPanel, FpsPanel, ResolutionPanel, AspectRatioPanel } from '@features/body-controls';
import { PresetsPanel, LanguagePanel, VibrationPanel, DebugPanel } from '@features/system-settings';
import { LensSelectionPanel } from '@features/lens-controls';
import { NoiseReductionPanel } from '@features/film-controls';

const SLIDER_PARAMETERS = [
  'grain',
  'bloom',
  'blackLevel',
  'highlights',
  'temperature',
  'tint',
  'sharpening',
  'pixelation',
  'ev',
  'iso',
  'shutter_speed',
  'focus',
  'contrast',
  'zoom',
  'chromatic_aberration',
  'saturation',
  'vignette',
  'chroma_shift',
  'tape_jitter',
  'scanlines',
];

interface PanelsProps {
  translateY: Animated.SharedValue<number>;
}

export const Panels = React.memo(({ translateY }: PanelsProps) => {
  const { activeParameter } = useSystemStore(useShallow(state => ({
    activeParameter: state.activeParameter,
  })));

  const parameterDetailPanelAnimatedStyle = useAnimatedStyle(() => {
    if (!translateY) return { opacity: 0 };
    const opacity = interpolate(
      translateY.value,
      [-15, -35],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      pointerEvents: translateY.value <= -15 ? 'auto' : 'none'
    };
  });

  const isSlider = SLIDER_PARAMETERS.includes(activeParameter);
  const sliderParameter = isSlider ? activeParameter : 'grain';

  const renderContent = () => {
    switch (activeParameter) {
      case 'torch':
        return <TorchPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'presets':
        return <PresetsPanel animatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'language':
        return <LanguagePanel animatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'vibration':
        return <VibrationPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'debug':
        return <DebugPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'camera_selection':
        return <LensSelectionPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'noise_reduction':
        return <NoiseReductionPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'fps_setting':
        return <FpsPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'resolution_setting':
        return <ResolutionPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'aspect_ratio':
        return <AspectRatioPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.contentContainer, parameterDetailPanelAnimatedStyle]}>
      <SliderPanel
        parameter={sliderParameter}
        parameterDetailPanelAnimatedStyle={[
          parameterDetailPanelAnimatedStyle,
          !isSlider && styles.hidden,
        ]}
      />
      {renderContent()}
    </Animated.View>
  );
});

Panels.displayName = 'Panels';

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
});
