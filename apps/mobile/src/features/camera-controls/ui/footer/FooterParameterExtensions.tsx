import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterControl } from './components/ParameterControl';
import { SliderExtension } from './components/SliderExtension';
import { useCameraWorklets } from '@features/camera-controls/lib/useCameraWorklets';
import { ParameterExtensionWrapper } from './components/ParameterExtensionWrapper';

import { LanguageExtension } from './sections/system/preferences/language';
import { DebugExtension } from './sections/system/preferences/debug';
import { NoiseReductionExtension } from './sections/film/texture/noise-reduction';
import { LensSelectionExtension } from './sections/lens/optics/camera-selection';
import { AspectRatioExtension } from './sections/body/capture/aspect-ratio';
import { FpsExtension } from './sections/body/capture/fps-setting';
import { ResolutionExtension } from './sections/body/capture/resolution-setting';
import { ChromaticAberrationExtension } from './sections/lens/flaws/aberration/ChromaticAberrationExtension';
import { GrainExtension } from './sections/film/texture/grain';
interface FooterParameterExtensionsProps {
  translateY: SharedValue<number>;
}

export const FooterParameterExtensions = ({ translateY }: FooterParameterExtensionsProps) => {
  const { t } = useTranslation();
  const worklets = useCameraWorklets();

  const { activeParameter, activeExtension, setActiveExtension } = useUIStore(useShallow(state => ({
    activeParameter: state.activeParameter,
    activeExtension: state.activeExtension,
    setActiveExtension: state.setActiveExtension,
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
            <GrainExtension />
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
            <ChromaticAberrationExtension />
          </Animated.View>
        </View>
      );
    case 'torch':
      return (
        <View style={styles.container}>
          <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
            <ParameterControl
              label=""
              isActive={false}
              hideDebugRectangles={true}
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
          </ParameterExtensionWrapper>
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <ParameterControl
              label={t('parameters.torch_dimmer')}
              isActive={activeExtension === 'torch_strength'}
              onPress={() => setActiveExtension('torch_strength')}
              value={torchStrength}
              minValue={0.1}
              maxValue={1}
              onChange={setTorchStrength}
              onUpdateWorklet={worklets.updateTorchStrength}
              variant="slider"
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
      return <LanguageExtension animatedStyle={parameterExtensionAnimatedStyle} />;
    case 'debug':
      return <DebugExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'camera_selection':
      return <LensSelectionExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'noise_reduction':
      return <NoiseReductionExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'aspect_ratio':
      return <AspectRatioExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'fps_setting':
      return <FpsExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'resolution_setting':
      return <ResolutionExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;

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
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    width: '100%',
    gap: 40,
  },
});
