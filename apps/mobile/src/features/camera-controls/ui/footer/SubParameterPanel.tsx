import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterControl } from './ParameterControl';
import { SliderExtension } from './SliderExtension';

import { LanguageSubPanel } from './sections/system/preferences/language/LanguageSubPanel';
import { DebugSubPanel } from './sections/system/preferences/debug/DebugSubPanel';
import { NoiseReductionSubPanel } from './sections/film/texture/noise-reduction/NoiseReductionSubPanel';
import { LensSelectionSubPanel } from './sections/lens/optics/lens-selection/LensSelectionSubPanel';
import { AspectRatioSubPanel } from './sections/body/capture/aspect-ratio/AspectRatioSubPanel';
import { FpsSubPanel } from './sections/body/capture/fps/FpsSubPanel';
import { ResolutionSubPanel } from './sections/body/capture/resolution/ResolutionSubPanel';

interface SubParameterPanelProps {
  translateY: SharedValue<number>;
}

export const SubParameterPanel = ({ translateY }: SubParameterPanelProps) => {
  const { t } = useTranslation();
  
  const { activeParameter, activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeParameter: state.activeParameter,
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const {
    grainChroma,
    setGrainChroma,
    grainSize,
    setGrainSize,
    aberrationDirection,
    setAberrationDirection,
  } = useStylesStore(useShallow(state => ({
    grainChroma: state.grainChroma,
    setGrainChroma: state.setGrainChroma,
    grainSize: state.grainSize,
    setGrainSize: state.setGrainSize,
    aberrationDirection: state.aberrationDirection,
    setAberrationDirection: state.setAberrationDirection,
  })));

  const {
    torchState,
    setTorchState,
    torchStrength,
    setTorchStrength,
  } = useHardwareStore(useShallow(state => ({
    torchState: state.torchState,
    setTorchState: state.setTorchState,
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
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

  const parameterExtensionAnimatedStyle = useAnimatedStyle(() => {
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

  switch (activeParameter) {
    case 'grain':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter="grain"
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <ParameterControl
              label={t('parameters.chroma')}
              isActive={activeSubParameter === 'grain_chroma'}
              onPress={() => {
                setActiveSubParameter('grain_chroma');
                setGrainChroma(grainChroma.value === 0 ? 1 : 0);
              }}
              value={grainChroma}
              renderValue={true}
              variant="text"
              valueFormatter={(v) => {
                'worklet';
                return v === 0 ? 'MONO' : 'RGB';
              }}
            />
            <ParameterControl
              label={t('parameters.size')}
              isActive={activeSubParameter === 'grain_size'}
              onPress={() => setActiveSubParameter('grain_size')}
              value={grainSize}
              minValue={1.0}
              maxValue={4.0}
              onChange={setGrainSize}
              renderValue={true}
              valueFormatter={(v) => {
                'worklet';
                return `${v.toFixed(1)}x`;
              }}
              variant="text"
            />
          </Animated.View>
        </View>
      );
    case 'chromatic_aberration':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter="chromatic_aberration"
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <ParameterControl
              label={t('parameters.direction')}
              isActive={activeSubParameter === 'aberration_direction'}
              onPress={() => {
                setActiveSubParameter(activeSubParameter === 'aberration_direction' ? 'none' : 'aberration_direction');
              }}
              value={aberrationDirection}
              onChange={(v) => {
                const nextDir = (Math.round(v) + 1) % 3;
                setAberrationDirection(nextDir);
              }}
              variant="text"
              renderValue={true}
              valueFormatter={(v) => {
                'worklet';
                switch (Math.round(v)) {
                  case 0: return 'STD';
                  case 1: return 'HOR';
                  case 2: return 'RAD';
                  default: return 'STD';
                }
              }}
            />
          </Animated.View>
        </View>
      );
    case 'torch':
      return (
        <View style={styles.container}>
          <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
            <ParameterControl
              label=""
              isActive={false}
              onPress={() => {
                setTorchState(torchState.value === 0 ? 1 : 0);
              }}
              value={torchState}
              variant="text"
              renderValue={true}
              isToggle={true}
              valueFormatter={(v) => {
                'worklet';
                return v === 0 ? 'OFF' : 'ON';
              }}
            />
          </Animated.View>
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <ParameterControl
              label={t('parameters.torch_dimmer')}
              isActive={activeSubParameter === 'torch_strength'}
              onPress={() => setActiveSubParameter('torch_strength')}
              value={torchStrength}
              minValue={0.1}
              maxValue={1}
              onChange={setTorchStrength}
              variant="text"
              renderValue={true}
              valueFormatter={(v) => {
                'worklet';
                return `${(v * 100).toFixed(0)}`;
              }}
            />
          </Animated.View>
        </View>
      );
    case 'language':
      return <LanguageSubPanel animatedStyle={animatedStyle} />;
    case 'debug':
      return <DebugSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'camera_selection':
      return <LensSelectionSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'noise_reduction':
      return <NoiseReductionSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'aspect_ratio':
      return <AspectRatioSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'fps_setting':
      return <FpsSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'resolution_setting':
      return <ResolutionSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;

    // Slider-only parameters (no children)
    case 'contrast':
    case 'saturation':
    case 'temperature':
    case 'tint':
    case 'sharpening':
    case 'ev':
    case 'iso':
    case 'shutter_speed':
    case 'focus':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter={activeParameter}
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
        </View>
      );
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
    gap: 40,
  },
});
