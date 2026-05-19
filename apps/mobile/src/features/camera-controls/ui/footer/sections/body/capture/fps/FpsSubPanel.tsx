import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface FpsSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

interface FpsButtonProps {
  val: number;
  fpsSetting: SharedValue<number>;
  setFpsSetting: (val: number) => void;
}

const FpsButton = ({ val, fpsSetting, setFpsSetting }: FpsButtonProps) => {
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
      <Animated.View style={[styles.pillButton, animatedStyle]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {val}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const FpsSubPanel = ({ parameterExtensionAnimatedStyle }: FpsSubPanelProps) => {
  const isDebugEnabled = useUIStore(state => state.isDebugEnabled);
  const { fpsSetting, setFpsSetting, capabilities } = useHardwareStore(useShallow(state => ({
    fpsSetting: state.fpsSetting,
    setFpsSetting: state.setFpsSetting,
    capabilities: state.capabilities,
  })));

  const maxFps = capabilities.maxFps ?? 60;
  const fpsOptions = [24, 30, 60].filter(f => f <= maxFps);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.parameterExtensionContainer, 
          parameterExtensionAnimatedStyle,
        ]}
      >
        <View style={[
          styles.debugWrapper,
          isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
        ]}>
          <View style={styles.buttonRow}>
            {fpsOptions.map(val => (
              <FpsButton
                key={val}
                val={val}
                fpsSetting={fpsSetting}
                setFpsSetting={setFpsSetting}
              />
            ))}
          </View>
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
    paddingTop: 5,
    paddingBottom: 5,
  },
  debugWrapper: {
    width: '100%',
    justifyContent: 'center',
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
