import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';

// We will import the new SubPanels here once they are ready.
import { GrainSubPanel, ContrastSubPanel, SaturationSubPanel, ChromaShiftSubPanel, ChromaticAberrationSubPanel } from '@features/film-controls';
import { ZoomSubPanel, TorchSubPanel, ResolutionSubPanel, AspectRatioSubPanel } from '@features/body-controls';

interface SubPanelsProps {
  translateY: SharedValue<number>;
}

export const SubPanels = React.memo(({ translateY }: SubPanelsProps) => {
  const { activeParameter, isDebugEnabled } = useSystemStore(useShallow(state => ({
    activeParameter: state.activeParameter,
    isDebugEnabled: state.isDebugEnabled,
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
      case 'chroma_shift':
        return <ChromaShiftSubPanel animatedStyle={dummyStyle} />;
      case 'torch': return <TorchSubPanel animatedStyle={dummyStyle} />;
      case 'resolution_setting': return <ResolutionSubPanel animatedStyle={dummyStyle} />;
      case 'aspect_ratio': return <AspectRatioSubPanel animatedStyle={dummyStyle} />;
      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <Animated.View style={[styles.childSubContainer, parentAnimatedStyle]}>
      <View
        style={[
          styles.wrapper,
          isDebugEnabled && styles.debugWrapper,
        ]}
      >
        {content}
      </View>
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
  wrapper: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  debugWrapper: {
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    marginTop: -6,
  },
});
