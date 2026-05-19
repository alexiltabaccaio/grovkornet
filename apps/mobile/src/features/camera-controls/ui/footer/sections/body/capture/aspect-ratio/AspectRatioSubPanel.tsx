import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';

interface AspectRatioSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

interface RatioButtonProps {
  label: string;
  index: number;
  aspectRatio: SharedValue<number>;
  setAspectRatio: (val: number) => void;
}

const RatioButton = ({ label, index, aspectRatio, setAspectRatio }: RatioButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = aspectRatio.value === index;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isSelected = aspectRatio.value === index;
    return {
      color: isSelected ? '#FFF' : '#888',
    };
  });

  return (
    <Pressable
      onPress={() => {
        setAspectRatio(index);
      }}
      style={styles.pressable}
    >
      <Animated.View style={[styles.pillButton, animatedStyle]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const AspectRatioSubPanel = ({ parameterExtensionAnimatedStyle }: AspectRatioSubPanelProps) => {
  const { aspectRatio, setAspectRatio } = useHardwareStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
  })));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <View style={styles.buttonRow}>
          {ASPECT_RATIOS.map((label, index) => (
            <RatioButton
              key={index}
              label={label}
              index={index}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  pressable: {
    flex: 1,
    maxWidth: 65,
  },
  pillButton: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
