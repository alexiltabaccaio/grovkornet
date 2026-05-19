import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { GrainSubPanel } from './sections/film/texture/grain/GrainSubPanel';
import { TorchSubPanel } from './sections/body/lighting/torch/TorchSubPanel';
import { AberrationSubPanel } from './sections/lens/flaws/aberration/AberrationSubPanel';
import { LanguageSubPanel } from './sections/system/preferences/language/LanguageSubPanel';
import { SharpeningSubPanel } from './sections/film/texture/sharpening/SharpeningSubPanel';
import { SaturationSubPanel } from './sections/film/development/saturation/SaturationSubPanel';
import { ContrastSubPanel } from './sections/film/development/contrast/ContrastSubPanel';
import { TemperatureSubPanel } from './sections/film/development/temperature/TemperatureSubPanel';
import { NoiseReductionSubPanel } from './sections/film/texture/noise-reduction/NoiseReductionSubPanel';
import { EvSubPanel } from './sections/body/exposure/ev/EvSubPanel';
import { IsoSubPanel } from './sections/body/exposure/iso/IsoSubPanel';
import { ShutterSpeedSubPanel } from './sections/body/exposure/shutter-speed/ShutterSpeedSubPanel';
import { FocusSubPanel } from './sections/lens/optics/focus/FocusSubPanel';
import { LensSelectionSubPanel } from './sections/lens/optics/lens-selection/LensSelectionSubPanel';
import { TintSubPanel } from './sections/film/development/tint/TintSubPanel';
import { AspectRatioSubPanel } from './sections/body/capture/aspect-ratio/AspectRatioSubPanel';
import { FpsSubPanel } from './sections/body/capture/fps/FpsSubPanel';
import { ResolutionSubPanel } from './sections/body/capture/resolution/ResolutionSubPanel';

interface SubParameterPanelProps {
  translateY: SharedValue<number>;
}

export const SubParameterPanel = ({ translateY }: SubParameterPanelProps) => {
  const { activeParameter } = useUIStore(useShallow(state => ({
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
      return <GrainSubPanel animatedStyle={animatedStyle} parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'torch':
      return <TorchSubPanel animatedStyle={animatedStyle} parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'chromatic_aberration':
      return <AberrationSubPanel animatedStyle={animatedStyle} parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'language':
      return <LanguageSubPanel animatedStyle={animatedStyle} />;
    case 'sharpening':
      return <SharpeningSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'saturation':
      return <SaturationSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'contrast':
      return <ContrastSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'temperature':
      return <TemperatureSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'noise_reduction':
      return <NoiseReductionSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'ev':
      return <EvSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'iso':
      return <IsoSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'shutter_speed':
      return <ShutterSpeedSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'focus':
      return <FocusSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'camera_selection':
      return <LensSelectionSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'tint':
      return <TintSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'aspect_ratio':
      return <AspectRatioSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'fps_setting':
      return <FpsSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'resolution_setting':
      return <ResolutionSubPanel parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    default:
      return null;
  }
};
