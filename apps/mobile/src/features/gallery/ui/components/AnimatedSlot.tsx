import React, { memo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { GalleryItem } from '../../lib/types';
import { AppState, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AnimatedSlotProps {
  photo: GalleryItem;
  index: number;
  translateX: SharedValue<number>;
  slotWidth: number;
  gap: number;
  rotationY?: SharedValue<number>;
  zoomScale?: SharedValue<number>;
  zoomTranslateX?: SharedValue<number>;
  zoomTranslateY?: SharedValue<number>;
  isTeleporting?: SharedValue<boolean>;
  teleportMockIndex?: SharedValue<number>;
  teleportRealIndex?: SharedValue<number>;
  onLoad?: () => void;
}

export const AnimatedSlot = memo(({
  photo,
  index,
  translateX,
  slotWidth,
  gap,
  rotationY,
  zoomScale,
  zoomTranslateX,
  zoomTranslateY,
  isTeleporting,
  teleportMockIndex,
  teleportRealIndex,
  onLoad,
}: AnimatedSlotProps) => {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const headerHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 47;
  const footerHeight = 80 + (insets.bottom ?? 0);
  const containerWidth = screenW;
  const containerHeight = screenH - headerHeight - footerHeight;

  // Track previous URI as placeholder for resolution upgrades
  const previousUriRef = React.useRef<string>(photo.uri);
  const previousIdRef = React.useRef<string>(photo.id);
  const placeholderUriRef = React.useRef<string | undefined>(undefined);

  if (photo.uri !== previousUriRef.current) {
    // Keep placeholder only for same photo (thumbnail -> high-res)
    if (photo.id === previousIdRef.current) {
      placeholderUriRef.current = previousUriRef.current;
    } else {
      placeholderUriRef.current = undefined;
    }
    previousUriRef.current = photo.uri;
    previousIdRef.current = photo.id;
  }

  // Fix expo-image blank issue after heavy intents (e.g. IG Share)
  // Dummy header forces seamless re-fetch without unmounting (avoids flash)
  const [appStateKey, setAppStateKey] = React.useState(0);
  React.useEffect(() => {
    let rafId: number;
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Use requestAnimationFrame to sync the JS state update with the Reanimated
        // UI thread rendering, avoiding layout tearing / showing the wrong index on resume.
        rafId = requestAnimationFrame(() => {
          setAppStateKey(prev => prev + 1);
        });
      }
    });
    return () => {
      subscription.remove();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const outerStyle = useAnimatedStyle(() => {
    let effectiveIndex = index;
    if (isTeleporting?.value && index === teleportRealIndex?.value) {
      effectiveIndex = teleportMockIndex?.value ?? index;
    }

    const isTearing = teleportMockIndex?.value === -2;
    const targetIdx = teleportRealIndex?.value;

    let currentX = effectiveIndex * slotWidth + translateX.value;
    
    if (isTearing) {
      currentX = (index === targetIdx) ? 0 : -9999;
    }

    const isFocused = Math.abs(currentX) < slotWidth / 2;

    const angle = rotationY ? rotationY.value : 0;
    const normalizedAngle = Math.abs(angle % 90);
    const isRotating = normalizedAngle > 1 && normalizedAngle < 89;

    let opacity = (!isFocused && isRotating) ? 0 : 1;
    if (isTeleporting?.value && index === teleportMockIndex?.value && index !== teleportRealIndex?.value) {
      opacity = 0;
    }

    return {
      transform: [{ translateX: currentX }],
      zIndex: isFocused ? 10 : 0,
      opacity,
    };
  });

  const zoomStyle = useAnimatedStyle(() => {
    if (!zoomScale || !zoomTranslateX || !zoomTranslateY) {
      return {};
    }

    let effectiveIndex = index;
    if (isTeleporting?.value && index === teleportRealIndex?.value) {
      effectiveIndex = teleportMockIndex?.value ?? index;
    }

    const isTearing = teleportMockIndex?.value === -2;
    const targetIdx = teleportRealIndex?.value;

    let currentX = effectiveIndex * slotWidth + translateX.value;
    
    if (isTearing) {
      currentX = (index === targetIdx) ? 0 : -9999;
    }

    const isFocused = Math.abs(currentX) < slotWidth / 2;
    if (!isFocused) {
      return {};
    }
    return {
      transform: [
        { translateX: zoomTranslateX.value },
        { translateY: zoomTranslateY.value },
        { scale: zoomScale.value },
      ],
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    const angle = rotationY ? rotationY.value : 0;

    // Convert angle to radians for smooth width/height interpolation
    const rad = (angle * Math.PI) / 180;
    const sinSq = Math.sin(rad) * Math.sin(rad);
    const cosSq = Math.cos(rad) * Math.cos(rad);

    // Smoothly interpolate width and height based on the angle
    const currentWidth = containerWidth * cosSq + containerHeight * sinSq;
    const currentHeight = containerHeight * cosSq + containerWidth * sinSq;

    return {
      width: currentWidth,
      height: currentHeight,
      transform: [{ rotate: `${angle}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slotContainer,
        { width: slotWidth, paddingRight: gap },
        outerStyle,
      ]}
    >
      <Animated.View style={zoomStyle}>
        <Animated.View style={innerStyle}>
          <Image
            key={photo.id}
            source={{
              uri: photo.uri,
              headers: { 'x-app-state': appStateKey.toString() }
            }}
            placeholder={placeholderUriRef.current}
            style={styles.previewImage}
            contentFit="contain"
            transition={0}
            onLoad={onLoad}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    prevProps.slotWidth === nextProps.slotWidth &&
    prevProps.gap === nextProps.gap &&
    prevProps.photo.id === nextProps.photo.id &&
    prevProps.photo.uri === nextProps.photo.uri
  );
});

AnimatedSlot.displayName = 'AnimatedSlot';

const styles = StyleSheet.create({
  slotContainer: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center', // Prevents shifting off-screen
    alignItems: 'center',     // Prevents shifting off-screen
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

