import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from '@shared/lib/haptics';

interface ShutterButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const ShutterButton = ({ onPress, disabled }: ShutterButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
     
    scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled) return;
    // Stronger tactile feedback at the moment of actual shutter release
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.8}
      testID="shutter-button"
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
    >
      <Animated.View style={[styles.outerRing, animatedStyle]}>
        <View style={styles.innerCircle} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 84,
    height: 84,
  },
  outerRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
});
