import React from 'react';
import { StyleSheet, StyleProp, ViewStyle , Pressable } from 'react-native';

import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface FpsExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

interface FpsButtonProps {
  val: number;
  fpsSetting: SharedValue<number>;
  setFpsSetting: (val: number) => void;
}

const FpsButton = ({ val, fpsSetting, setFpsSetting }: FpsButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = Math.round(fpsSetting.value) === val;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isSelected = Math.round(fpsSetting.value) === val;
    return {
      color: isSelected ? '#FFF' : '#888',
    };
  });

  return (
    <Pressable 
      onPress={() => {
        setFpsSetting(val);
      }}
      style={styles.pressable}
    >
      <Animated.View style={[
        styles.pillButton,
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {val}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const FpsExtension = ({ parameterExtensionAnimatedStyle }: FpsExtensionProps) => {
  const { fpsSetting, setFpsSetting, capabilities } = useHardwareStore(useShallow(state => ({
    fpsSetting: state.fpsSetting,
    setFpsSetting: state.setFpsSetting,
    capabilities: state.capabilities,
  })));

  const maxFps = capabilities.maxFps ?? 60;
  const fpsOptions = [60, 30, 24].filter(f => f <= maxFps);

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
      {fpsOptions.map(val => (
        <FpsButton
          key={val}
          val={val}
          fpsSetting={fpsSetting}
          setFpsSetting={setFpsSetting}
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
