import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Image, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { useUIStore } from '../model/useUIStore';
import { useShallow } from 'zustand/react/shallow';

interface CaptureThumbnailProps {
  onPress: () => void;
}

export const CaptureThumbnail = ({ onPress }: CaptureThumbnailProps) => {
  const { isCapturing, latestCapturedUri } = useUIStore(useShallow(state => ({
    isCapturing: state.isCapturing,
    latestCapturedUri: state.latestCapturedUri,
  })));

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCapturing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
      scale.value = withSpring(0.95);
    } else {
      rotation.value = 0;
      scale.value = withSpring(1);
    }
  }, [isCapturing, rotation, scale]);

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isCapturing && !latestCapturedUri) {
    return <View style={styles.placeholder} />;
  }

  return (
    <Pressable testID="capture-thumbnail" onPress={onPress} style={styles.wrapper}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {isCapturing ? (
          <Animated.View style={[styles.spinnerContainer, animatedSpinnerStyle]}>
            <View style={styles.spinnerRing} />
            <ActivityIndicator size="small" color="#FF9500" />
          </Animated.View>
        ) : latestCapturedUri ? (
          <Image source={{ uri: latestCapturedUri }} style={styles.image} />
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  container: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  spinnerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    borderTopColor: '#FF9500',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
