import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import * as Haptics from '@shared/lib/haptics';

export const CameraFlipButton = () => {
  const { isSelfieCamera, setIsSelfieCamera } = useFilmStore(
    useShallow((s) => ({
      isSelfieCamera: s.isSelfieCamera,
      setIsSelfieCamera: s.setIsSelfieCamera,
    }))
  );
  
  const { t } = useTranslation();
  const rotation = useSharedValue(0);

  const handlePress = () => {
    void Haptics.selectionAsync();
    const nextVal = !isSelfieCamera.value;
    setIsSelfieCamera(nextVal);

    // Spin animation: rotate 180 degrees on each flip
    rotation.value = withSpring(rotation.value + 180, {
      damping: 15,
      stiffness: 150,
    });

    // We removed the code that disables the torch safely when switching to selfie mode
    // to allow the torch to stay on or turn back on automatically.
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Pressable
      testID="camera-flip-button"
      onPress={handlePress}
      accessibilityLabel={t('camera.flip')}
      accessibilityRole="button"
      style={styles.wrapper}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
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
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
