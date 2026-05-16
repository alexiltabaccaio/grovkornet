import React, { useEffect } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';
import { FooterSections } from './FooterSections';
import { FooterModules } from './FooterModules';
import { FooterParameters } from './FooterParameters';

import { SubParameterPanel } from './SubParameterPanel';

import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, useAnimatedProps } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);


interface FooterProps {
  translateY?: Animated.SharedValue<number>;
}

export const Footer = ({ translateY: externalTranslateY }: FooterProps) => {
  const { activeSection, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    isDebugEnabled: state.isDebugEnabled,
  })));


  const localTranslateY = useSharedValue(0);
  const translateY = externalTranslateY || localTranslateY;
  const startY = useSharedValue(0);
  const drawerAnimation = useSharedValue(220); // 220px is the height of the drawer, starting closed

  useEffect(() => {
    if (activeSection === 'none') {
      // Chiudi il cassetto
      translateY.value = 0; // reset the pan gesture
      drawerAnimation.value = withTiming(250, { duration: 300 }); // push it down to hide
    } else {
      // Apri il cassetto
      drawerAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [activeSection, translateY, drawerAnimation]);

  const MAX_UP = -250; // Massima altezza (aperto)

  const panGesture = Gesture.Pan()
    .activeOffsetY([-5, 5]) // Evita conflitti con scroll orizzontali
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      let newY = startY.value + e.translationY;
      // Clamp tra aperto e chiuso
      if (newY < MAX_UP) newY = MAX_UP;
      if (newY > 0) newY = 0;
      translateY.value = newY;
    })
    .onEnd((e) => {
      const estimatedY = translateY.value + e.velocityY * 0.1;
      const snapPoints = [0, -75, MAX_UP];
      
      const targetY = snapPoints.reduce((prev, curr) => 
        Math.abs(curr - estimatedY) < Math.abs(prev - estimatedY) ? curr : prev
      );

      translateY.value = withSpring(targetY, {
        damping: 20,
        stiffness: 200,
        mass: 1,
      });
    });

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
      <View style={[styles.unifiedBackgroundBase, styles.unifiedBackgroundClosed]} pointerEvents="none" />
      <Animated.View 
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
    backgroundColor: '#000',
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

