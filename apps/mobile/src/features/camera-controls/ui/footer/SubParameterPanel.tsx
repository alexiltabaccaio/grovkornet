import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { GrainSubPanel } from './sections/film/texture/grain/GrainSubPanel';
import { TorchSubPanel } from './sections/body/lighting/torch/TorchSubPanel';
import { AberrationSubPanel } from './sections/lens/flaws/aberration/AberrationSubPanel';
import { LanguageSubPanel } from './sections/system/preferences/language/LanguageSubPanel';

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

  if (!translateY || activeParameter === 'none') return null;

  switch (activeParameter) {
    case 'grain':
      return <GrainSubPanel animatedStyle={animatedStyle} />;
    case 'torch':
      return <TorchSubPanel animatedStyle={animatedStyle} />;
    case 'chromatic_aberration':
      return <AberrationSubPanel animatedStyle={animatedStyle} />;
    case 'language':
      return <LanguageSubPanel animatedStyle={animatedStyle} />;
    default:
      return null;
  }
};
