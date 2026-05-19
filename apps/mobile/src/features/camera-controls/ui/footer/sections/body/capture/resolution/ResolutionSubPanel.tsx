import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';

interface ResolutionSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['720p', '1080p', '4K'];

export const ResolutionSubPanel = ({ parameterExtensionAnimatedStyle }: ResolutionSubPanelProps) => {
  const { resolutionSetting, setResolutionSetting } = useHardwareStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
  })));

  const renderButton = (label: string, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const isSelected = resolutionSetting.value === index;
      return {
        borderColor: isSelected ? '#FFF' : '#333',
        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
      };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      const isSelected = resolutionSetting.value === index;
      return {
        color: isSelected ? '#FFF' : '#888',
      };
    });

    return (
      <Pressable
        key={index}
        onPress={() => {
          setResolutionSetting(index);
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

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <View style={styles.buttonRow}>
          {RESOLUTIONS.map((label, index) => renderButton(label, index))}
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
    marginTop: -35,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  pressable: {
    flex: 1,
    maxWidth: 80,
  },
  pillButton: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
