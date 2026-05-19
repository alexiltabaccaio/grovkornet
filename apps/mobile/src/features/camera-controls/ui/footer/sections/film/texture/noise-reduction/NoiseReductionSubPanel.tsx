import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';

interface NoiseReductionSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

interface AutoButtonProps {
  noiseReductionAuto: SharedValue<boolean>;
  setNoiseReductionAuto: (auto: boolean) => void;
}

const AutoButton = ({ noiseReductionAuto, setNoiseReductionAuto }: AutoButtonProps) => {
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
      <Animated.View style={[styles.pillButton, animatedStyle]}>
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
  const animatedStyle = useAnimatedStyle(() => {
    const isAuto = noiseReductionAuto.value;
    const isSelected = !isAuto && noiseReductionMode.value === modeValue;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
      opacity: isAuto ? 0.4 : 1,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isAuto = noiseReductionAuto.value;
    const isSelected = !isAuto && noiseReductionMode.value === modeValue;
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
      <Animated.View style={[styles.pillButton, animatedStyle]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const NoiseReductionSubPanel = ({ parameterExtensionAnimatedStyle }: NoiseReductionSubPanelProps) => {
  const { noiseReductionMode, setNoiseReductionMode, noiseReductionAuto, setNoiseReductionAuto } = useStylesStore(useShallow(state => ({
    noiseReductionMode: state.noiseReductionMode,
    setNoiseReductionMode: state.setNoiseReductionMode,
    noiseReductionAuto: state.noiseReductionAuto,
    setNoiseReductionAuto: state.setNoiseReductionAuto,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Righe dei pulsanti di selezione (sempre visibili a -35px) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <View style={styles.buttonRow}>
          <AutoButton
            noiseReductionAuto={noiseReductionAuto}
            setNoiseReductionAuto={setNoiseReductionAuto}
          />
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
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  autoPressable: {
    width: 40,
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
