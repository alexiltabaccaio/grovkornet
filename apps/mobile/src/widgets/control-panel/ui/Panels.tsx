import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';
import { useControlPanelStore } from '@entities/system';
import { ParameterType } from '@entities/system';

import { SliderPanel } from './components/SliderPanel';
import { TorchPanel, FpsPanel, ResolutionPanel, AspectRatioPanel } from '@features/sections/body';
import { LanguagePanel, VibrationPanel, StabilizationPanel, DebugPanels } from '@features/sections/system';
import { PresetsPanel } from '@features/presets';
import { LensSelectionPanel } from '@features/sections/lens';
import { NoiseReductionPanel } from '@features/sections/film';

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
  'hue',
  'vignette',
  'chroma_shift',
  'tape_jitter',
  'scanlines',
  'lens_distortion',
  'halation',
  'chroma_bleed',
];

interface PanelsProps {
  translateY: SharedValue<number>;
}

export const Panels = React.memo(({ translateY }: PanelsProps) => {
  const { storeActiveParameter, storeActiveSection } = useControlPanelStore(useShallow(state => ({
    storeActiveParameter: state.activeParameter,
    storeActiveSection: state.activeSection,
  })));

  const [deferredParameter, setDeferredParameter] = React.useState<ParameterType>(storeActiveParameter);
  
  // Instantly reflect active parameter when opening/switching, but defer when closing to 'none'
  const activeParameter = storeActiveParameter !== 'none' ? storeActiveParameter : deferredParameter;

  React.useEffect(() => {
    if (storeActiveParameter === 'none') {
      if (storeActiveSection === 'none') {
        const timeout = setTimeout(() => {
          setDeferredParameter('none');
        }, 300); // Wait for the drawer animation to finish
        return () => clearTimeout(timeout);
      } else {
        setDeferredParameter('none');
      }
    } else {
      setDeferredParameter(storeActiveParameter);
    }
  }, [storeActiveParameter, storeActiveSection]);

  const panelAnimatedStyle = useAnimatedStyle(() => {
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
  }) as unknown as StyleProp<ViewStyle>;

  const isSlider = SLIDER_PARAMETERS.includes(activeParameter);

  const renderContent = () => {
    switch (activeParameter) {
      case 'torch':
        return <TorchPanel animatedStyle={panelAnimatedStyle} />;
      case 'presets':
        return <PresetsPanel animatedStyle={panelAnimatedStyle} />;
      case 'language':
        return <LanguagePanel animatedStyle={panelAnimatedStyle} />;
      case 'vibration':
        return <VibrationPanel animatedStyle={panelAnimatedStyle} />;
      case 'stabilization_mode':
        return <StabilizationPanel animatedStyle={panelAnimatedStyle} />;
      case 'ui_overlay':
      case 'temperature_test':
      case 'developer_options':
        return <DebugPanels parameter={activeParameter} animatedStyle={panelAnimatedStyle} />;
      case 'camera_selection':
        return <LensSelectionPanel animatedStyle={panelAnimatedStyle} />;
      case 'noise_reduction':
        return <NoiseReductionPanel animatedStyle={panelAnimatedStyle} />;
      case 'fps_setting':
        return <FpsPanel animatedStyle={panelAnimatedStyle} />;
      case 'resolution_setting':
        return <ResolutionPanel animatedStyle={panelAnimatedStyle} />;
      case 'aspect_ratio':
        return <AspectRatioPanel animatedStyle={panelAnimatedStyle} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.contentContainer, panelAnimatedStyle]}>
      {isSlider && (
        <SliderPanel
          key={activeParameter}
          parameter={activeParameter}
          isActiveOverride={true}
          animatedStyle={panelAnimatedStyle}
        />
      )}
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
});
