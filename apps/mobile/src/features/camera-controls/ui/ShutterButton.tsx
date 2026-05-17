import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ShutterButtonProps {
  onPress: () => void;
  disabled?: boolean;
  translateY?: Animated.SharedValue<number>;
}

export const ShutterButton = ({ onPress, disabled, translateY }: ShutterButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || (translateY && translateY.value < -50)) return;
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || (translateY && translateY.value < -50)) return;
    // Feedback tattile più forte allo scatto reale
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
    >
      <Animated.View style={[styles.outerRing, animatedStyle]}>
        <View style={styles.innerCircle} />
      </Animated.View>
    </Pressable>
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
