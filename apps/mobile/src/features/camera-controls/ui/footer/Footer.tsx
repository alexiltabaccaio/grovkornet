import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { FooterSections } from './FooterSections';
import { FooterModules } from './FooterModules';
import { FooterParameters } from './FooterParameters';

import { SubParameterPanel } from './SubParameterPanel';

import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, useAnimatedProps } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface FooterProps {
  translateY?: Animated.SharedValue<number>;
  drawerAnimation?: Animated.SharedValue<number>;
}

export const Footer = ({ translateY: externalTranslateY, drawerAnimation: externalDrawerAnimation }: FooterProps) => {
  const { activeSection, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    isDebugEnabled: state.isDebugEnabled,
  })));


  const localTranslateY = useSharedValue(0);
  const translateY = externalTranslateY || localTranslateY;
  const startY = useSharedValue(0);
  const localDrawerAnimation = useSharedValue(250);
  const drawerAnimation = externalDrawerAnimation || localDrawerAnimation;


  useEffect(() => {
    if (activeSection === 'none') {
      // Chiudi il cassetto
      translateY.value = 0; // reset the pan gesture
      drawerAnimation.value = withTiming(250, { duration: 300 }); // push it down to hide
    } else {
      // Apri il cassetto
      translateY.value = withTiming(-5, { duration: 300 }); // Imposta l'altezza base a -5px con animazione fluida
      drawerAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [activeSection, translateY, drawerAnimation]);

  const MAX_UP = -250; // Massima altezza (aperto)

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-15, 15]) // Aumentato per evitare che piccoli movimenti (wiggle) durante il tap rubino l'evento
      .failOffsetX([-15, 15]) // Fa fallire la gesture se ci si muove orizzontalmente, sbloccando i tocchi
      .onStart(() => {
        startY.value = translateY.value;
      })
      .onUpdate((e) => {
        let newY = startY.value + e.translationY;
        // Clamp tra aperto e chiuso (ora limitato a -5px come base)
        if (newY < MAX_UP) newY = MAX_UP;
        if (newY > -5) newY = -5;

        translateY.value = newY;
      })
      .onEnd((e) => {
        const estimatedY = translateY.value + e.velocityY * 0.1;
        const snapPoints = [-5, -115, MAX_UP];

        const targetY = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - estimatedY) < Math.abs(prev - estimatedY) ? curr : prev
        );


        translateY.value = withSpring(targetY, {
          damping: 20,
          stiffness: 200,
          mass: 1,
        });
      });
  }, [startY, translateY, MAX_UP]);

  const debugTextProps = useAnimatedProps(() => {
    return {
      text: `Y: ${Math.round(translateY.value)}px`,
      defaultValue: `Y: 0px`,
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + drawerAnimation.value }],
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
      <BlurView intensity={80} tint="dark" style={[styles.unifiedBackgroundBase, styles.unifiedBackgroundClosed]} pointerEvents="none" />
      <AnimatedBlurView
        intensity={80}
        tint="dark"
        style={[
          styles.unifiedBackgroundBase,
          styles.unifiedBackgroundOpen,
          animatedBackgroundStyle
        ]}
        pointerEvents="none"
      />
      <Animated.View style={[styles.topFooterContainer, animatedTopFooterStyle]} pointerEvents={isSheetVisible ? "box-none" : "none"}>
        <GestureDetector gesture={panGesture}>
          <View>
            <View style={styles.topFooter}>
              <FooterModules />
              <FooterParameters />
            </View>
            {isDebugEnabled && (
              <View style={styles.debugContainer} pointerEvents="none">
                <AnimatedTextInput
                  style={styles.debugText}
                  animatedProps={debugTextProps}
                  editable={false}
                />
              </View>
            )}
            {/* Area espansa che riempie il vuoto sotto quando si tira su */}
            <View style={styles.expandedBackground}>
              <SubParameterPanel translateY={translateY} />
            </View>
          </View>
        </GestureDetector>
      </Animated.View>

      <FooterSections />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  unifiedBackgroundBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  unifiedBackgroundClosed: {
    top: 0,
    height: 1000,
  },
  unifiedBackgroundOpen: {
    bottom: -1000,
    height: 1220,
  },

  topFooterContainer: {
    width: '100%',
    position: 'absolute',
    bottom: -340, // -400 + 60px (altezza tab)
  },

  topFooter: {
    paddingTop: 0,
    height: 160,
  },


  expandedBackground: {
    height: 400, // Altezza abbondante per coprire il buco
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

