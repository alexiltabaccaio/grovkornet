import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useSystemStore } from '@entities/system';
import { Sections } from './Sections';
import { TopSection } from './TopSection';
import { Modules } from './Modules';
import { Parameters } from './Parameters';
import { Panels } from './Panels';
import { SubPanels } from './SubPanels';
import { useControlPanelGestures } from '../lib/useControlPanelGestures';

import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ControlPanelProps {
  translateY?: SharedValue<number>;
  drawerAnimation?: SharedValue<number>;
  galleryTransition?: SharedValue<number>;
}

export const ControlPanel = React.memo(({ translateY: externalTranslateY, drawerAnimation: externalDrawerAnimation, galleryTransition }: ControlPanelProps) => {
  const insets = useSafeAreaInsets();
  const { isLayoutOverlayEnabled } = useSystemStore(useShallow(state => ({
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled,
  })));

  const {
    translateY,
    drawerAnimation,
    panGesture,
    activeSection,
  } = useControlPanelGestures({
    externalTranslateY,
    externalDrawerAnimation,
  });

  const debugTextProps = useAnimatedProps(() => {
    return {
      text: `Y: ${Math.round(translateY.value)}px`,
      defaultValue: `Y: 0px`,
    };
  });

  const animatedTopFooterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + drawerAnimation.value }],
    };
  });

  const isSheetVisible = activeSection !== 'none';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View 
        style={[
          styles.topFooterContainer, 
          { bottom: -573 + insets.bottom },
          animatedTopFooterStyle
        ]} 
        pointerEvents={isSheetVisible ? "box-none" : "none"}
      >
        <GestureDetector gesture={panGesture}>
          <View>
            <View style={styles.topFooter}>
              <TopSection />
              <Modules />
              <Parameters />
            </View>
            {isLayoutOverlayEnabled && (
              <View style={styles.debugContainer} pointerEvents="none">
                <AnimatedTextInput
                  style={styles.debugText}
                  animatedProps={debugTextProps}
                  editable={false}
                />
              </View>
            )}
            {/* Expanded area that fills the gap underneath when pulled up */}
            <View style={styles.expandedBackground}>
              <Panels translateY={translateY} />
              <SubPanels translateY={translateY} />
            </View>
          </View>
        </GestureDetector>
      </Animated.View>

      <Sections galleryTransition={galleryTransition} />
    </View>
  );
});

ControlPanel.displayName = 'ControlPanel';
// (ControlPanel as React.NamedExoticComponent<ControlPanelProps> & { whyDidYouRender?: boolean }).whyDidYouRender = true;



const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: 'transparent',
    zIndex: 100,
  },

  topFooterContainer: {
    width: '100%',
    position: 'absolute',
    bottom: -573, // Mathematically calculated to align perfectly with the red sections (shifted 250px down)
    zIndex: 5,
    backgroundColor: 'rgba(18, 18, 18, 0.75)', // Restored translucent glass effect
  },

  topFooter: {
    paddingTop: 0,
    height: 147,
  },

  expandedBackground: {
    height: 400, // Ample height to cover the gap
  },





  debugContainer: {
    position: 'absolute',
    top: -30,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
