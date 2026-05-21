import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface NoiseReductionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

interface AutoButtonProps {
  noiseReductionAuto: SharedValue<boolean>;
  setNoiseReductionAuto: (auto: boolean) => void;
}

const AutoButton = ({ noiseReductionAuto, setNoiseReductionAuto }: AutoButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  const animatedStyle = useAnimatedStyle(() => {
    const isAuto = noiseReductionAuto.value;
    return {
      borderColor: isAuto ? '#FF453A' : '#333',
      backgroundColor: isAuto ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isAuto = noiseReductionAuto.value;
    return {
      color: isAuto ? '#FF453A' : '#888',
    };
  });

  return (
    <Pressable
      onPress={() => {
        setNoiseReductionAuto(!noiseReductionAuto.value);
      }}
      style={styles.autoPressable}
    >
      <Animated.View style={[
        styles.pillButton,
        { width: 32 },
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          A
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

interface ModeButtonProps {
  label: string;
  modeValue: number;
  noiseReductionMode: SharedValue<number>;
  noiseReductionAuto: SharedValue<boolean>;
  setNoiseReductionMode: (mode: number) => void;
  setNoiseReductionAuto: (auto: boolean) => void;
}

const ModeButton = ({
  label,
  modeValue,
  noiseReductionMode,
  noiseReductionAuto,
  setNoiseReductionMode,
  setNoiseReductionAuto,
}: ModeButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = noiseReductionMode.value === modeValue;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
      opacity: 1,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isSelected = noiseReductionMode.value === modeValue;
    return {
      color: isSelected ? '#FFF' : '#888',
    };
  });

  return (
    <Pressable
      onPress={() => {
        setNoiseReductionAuto(false);
        setNoiseReductionMode(modeValue);
      }}
      style={styles.pressable}
    >
      <Animated.View style={[
        styles.pillButton,
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const NoiseReductionExtension = ({ parameterExtensionAnimatedStyle }: NoiseReductionExtensionProps) => {
  const { noiseReductionMode, setNoiseReductionMode, noiseReductionAuto, setNoiseReductionAuto } = useStylesStore(useShallow(state => ({
    noiseReductionMode: state.noiseReductionMode,
    setNoiseReductionMode: state.setNoiseReductionMode,
    noiseReductionAuto: state.noiseReductionAuto,
    setNoiseReductionAuto: state.setNoiseReductionAuto,
  })));

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
      <View style={{ width: 54, alignItems: 'flex-start' }}>
        <AutoButton
          noiseReductionAuto={noiseReductionAuto}
          setNoiseReductionAuto={setNoiseReductionAuto}
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <ModeButton
          label="OFF"
          modeValue={0}
          noiseReductionMode={noiseReductionMode}
          noiseReductionAuto={noiseReductionAuto}
          setNoiseReductionMode={setNoiseReductionMode}
          setNoiseReductionAuto={setNoiseReductionAuto}
        />
        <ModeButton
          label="FAST"
          modeValue={1}
          noiseReductionMode={noiseReductionMode}
          noiseReductionAuto={noiseReductionAuto}
          setNoiseReductionMode={setNoiseReductionMode}
          setNoiseReductionAuto={setNoiseReductionAuto}
        />
        <ModeButton
          label="HQ"
          modeValue={2}
          noiseReductionMode={noiseReductionMode}
          noiseReductionAuto={noiseReductionAuto}
          setNoiseReductionMode={setNoiseReductionMode}
          setNoiseReductionAuto={setNoiseReductionAuto}
        />
      </View>
      <View style={{ width: 54 }} />
    </ParameterExtensionWrapper>
  );
};

const styles = StyleSheet.create({
  autoPressable: {
    width: 32,
  },
  pressable: {
    flex: 1,
    maxWidth: 75,
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
