import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';

// We will import the new SubPanels here once they are ready.
import { GrainSubPanel, ContrastSubPanel, SaturationSubPanel } from '@features/film-controls';
import { ChromaticAberrationSubPanel } from '@features/lens-controls';
import { ZoomSubPanel, TorchSubPanel, ResolutionSubPanel, AspectRatioSubPanel } from '@features/body-controls';

interface SubPanelsProps {
  translateY: Animated.SharedValue<number>;
}

export const SubPanels = React.memo(({ translateY }: SubPanelsProps) => {
  const { activeParameter } = useSystemStore(useShallow(state => ({
    activeParameter: state.activeParameter,
  })));

  const parentAnimatedStyle = useAnimatedStyle(() => {
    if (!translateY) return {};

    return {
      pointerEvents: translateY.value <= -50 ? 'auto' : 'none'
    };
  });

  if (activeParameter === 'none') return null;

  const renderContent = () => {
    const dummyStyle = {};
    switch (activeParameter) {
      case 'grain':
        return <GrainSubPanel animatedStyle={dummyStyle} />;
      case 'contrast':
        return <ContrastSubPanel animatedStyle={dummyStyle} />;
      case 'chromatic_aberration':
        return <ChromaticAberrationSubPanel animatedStyle={dummyStyle} />;
      case 'zoom':
        return <ZoomSubPanel animatedStyle={dummyStyle} />;
      case 'saturation':
        return <SaturationSubPanel animatedStyle={dummyStyle} />;
      case 'torch': return <TorchSubPanel animatedStyle={dummyStyle} />;
      case 'resolution_setting': return <ResolutionSubPanel animatedStyle={dummyStyle} />;
      case 'aspect_ratio': return <AspectRatioSubPanel animatedStyle={dummyStyle} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.childSubContainer, parentAnimatedStyle]}>
      {renderContent()}
    </Animated.View>
  );
});

SubPanels.displayName = 'SubPanels';

const styles = StyleSheet.create({
  childSubContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    width: '100%',
  },
});
