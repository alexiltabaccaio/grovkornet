import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';
import { useSystemStore, useControlPanelStore } from '@entities/system';

// We will import the new SubPanels here once they are ready.
import { GrainSubPanel, ContrastSubPanel, SelectiveColorSubPanel, ChromaShiftSubPanel, ChromaticAberrationSubPanel, ScanlinesSubPanel } from '@features/film-controls';
import { ZoomSubPanel, TorchSubPanel, ResolutionSubPanel, AspectRatioSubPanel } from '@features/body-controls';

const DUMMY_STYLE = {};

interface SubPanelsProps {
  translateY: SharedValue<number>;
}

export const SubPanels = React.memo(({ translateY }: SubPanelsProps) => {
  const activeParameter = useControlPanelStore(state => state.activeParameter);
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);

  const parentAnimatedStyle = useAnimatedStyle(() => {
    if (!translateY) return {};

    return {
      pointerEvents: translateY.value <= -50 ? 'auto' : 'none'
    };
  });

  if (activeParameter === 'none') return null;

  const renderContent = () => {
    switch (activeParameter) {
      case 'grain':
        return <GrainSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'scanlines':
        return <ScanlinesSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'contrast':
        return <ContrastSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'chromatic_aberration':
        return <ChromaticAberrationSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'zoom':
        return <ZoomSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'saturation':
        return <SelectiveColorSubPanel type="saturation" animatedStyle={DUMMY_STYLE} />;
      case 'hue':
        return <SelectiveColorSubPanel type="hue" animatedStyle={DUMMY_STYLE} />;
      case 'chroma_shift':
        return <ChromaShiftSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'torch': return <TorchSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'resolution_setting': return <ResolutionSubPanel animatedStyle={DUMMY_STYLE} />;
      case 'aspect_ratio': return <AspectRatioSubPanel animatedStyle={DUMMY_STYLE} />;
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
          isLayoutOverlayEnabled && styles.debugWrapper,
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
