import React from 'react';
import { StyleSheet, StyleProp, ViewStyle , Pressable } from 'react-native';

import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface ResolutionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['4K', '1080p', '720p', '480p', '360p', '240p', '144p'];

interface ResolutionButtonProps {
  label: string;
  index: number;
  resolutionSetting: SharedValue<number>;
  setResolutionSetting: (val: number) => void;
}

const ResolutionButton = ({ label, index, resolutionSetting, setResolutionSetting }: ResolutionButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

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
      onPress={() => {
        setResolutionSetting(index);
      }}
      style={styles.pressable}
    >
      <Animated.View style={[
        styles.pillButton,
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const ResolutionExtension = ({ parameterExtensionAnimatedStyle }: ResolutionExtensionProps) => {
  const { resolutionSetting, setResolutionSetting } = useHardwareStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
  })));

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
      {RESOLUTIONS.map((label, index) => (
        <ResolutionButton
          key={index}
          label={label}
          index={index}
          resolutionSetting={resolutionSetting}
          setResolutionSetting={setResolutionSetting}
        />
      ))}
    </ParameterExtensionWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 80,
  },
  pillButton: {
    height: 32,
    width: '100%',
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
