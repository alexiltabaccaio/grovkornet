import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import Animated, { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { SliderDetailPanel } from './components/SliderDetailPanel';

import { LanguageDetailPanel, DebugDetailPanel, PresetsDetailPanel, VibrationDetailPanel } from '@features/system-settings';
import { NoiseReductionDetailPanel, GrainDetailPanel, SaturationDetailPanel } from '@features/film-controls';
import { LensSelectionDetailPanel, ChromaticAberrationDetailPanel } from '@features/lens-controls';
import { AspectRatioDetailPanel, FpsDetailPanel, ResolutionDetailPanel, TorchDetailPanel } from '@features/body-controls';

interface ParameterDetailPanelsProps {
  translateY: SharedValue<number>;
}

export const ParameterDetailPanels = ({ translateY }: ParameterDetailPanelsProps) => {
  const { activeParameter } = useSystemStore(useShallow(state => ({
    activeParameter: state.activeParameter,
  })));

  const animatedStyle = useAnimatedStyle(() => {
    if (!translateY) return { opacity: 0 };

    const opacity = interpolate(
      translateY.value,
      [-90, -25, 0],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const parameterDetailPanelAnimatedStyle = useAnimatedStyle(() => {
    if (!translateY) return { opacity: 0 };

    const opacity = interpolate(
      translateY.value,
      [-35, -15, 0],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  if (!translateY || activeParameter === 'none') return null;

  const renderContent = () => {
    switch (activeParameter) {
      case 'grain':
        return (
          <>
            <SliderDetailPanel
              parameter="grain"
              parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
            />
            <Animated.View style={[styles.childSubContainer, animatedStyle]}>
              <GrainDetailPanel />
            </Animated.View>
          </>
        );
      case 'chromatic_aberration':
        return (
          <>
            <SliderDetailPanel
              parameter="chromatic_aberration"
              parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
            />
            <Animated.View style={[styles.childSubContainer, animatedStyle]}>
              <ChromaticAberrationDetailPanel />
            </Animated.View>
          </>
        );
      case 'torch':
        return (
          <TorchDetailPanel
            parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
            animatedStyle={animatedStyle}
          />
        );
      case 'presets':
        return <PresetsDetailPanel animatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'language':
        return <LanguageDetailPanel animatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'vibration':
        return <VibrationDetailPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'debug':
        return <DebugDetailPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'camera_selection':
        return <LensSelectionDetailPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'noise_reduction':
        return <NoiseReductionDetailPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'aspect_ratio':
        return <AspectRatioDetailPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'fps_setting':
        return <FpsDetailPanel parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle} />;
      case 'resolution_setting':
        return (
          <ResolutionDetailPanel
            parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
            animatedStyle={animatedStyle}
          />
        );

      case 'saturation':
        return (
          <SaturationDetailPanel
            parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
            animatedStyle={animatedStyle}
          />
        );

      // Slider-only parameters (no children)
      case 'bloom':
      case 'contrast':
      case 'temperature':
      case 'tint':
      case 'sharpening':
      case 'ev':
      case 'iso':
      case 'shutter_speed':
      case 'focus':
        return (
          <SliderDetailPanel
            parameter={activeParameter}
            parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    width: '100%',
    gap: 40,
  },
});
