import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import Animated, { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { useBodyStore } from '@entities/body';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const DebugOverlay = () => {
  const fps = useBodyStore(state => state.fps);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.badge} pointerEvents="none">
        <ReanimatedValueText
          label="FPS"
          value={fps}
          formatter={(v: number) => {
            'worklet';
            return Math.round(v).toString();
          }}
        />
        <View style={styles.separator} />
        <ReanimatedValueText
          label="HW"
          value={useBodyStore(state => state.hwFps)}
          formatter={(v: number) => {
            'worklet';
            return Math.round(v).toString() + 'hz';
          }}
        />

        <View style={styles.separator} />
        <ReanimatedResolutionText />
      </View>
    </View>
  );
};

const ReanimatedResolutionText = () => {
  const resolution = useBodyStore(state => state.resolution);
  const aspectRatio = useBodyStore(state => state.aspectRatio);

  const animatedProps = useAnimatedProps(() => {
    const resStr = resolution.value;
    if (!resStr) return { text: 'RES: -' };
    const parts = resStr.split('x');
    if (parts.length !== 2) return { text: `RES: ${resStr}` };

    const camW = Number(parts[0]);
    const camH = Number(parts[1]);
    if (isNaN(camW) || isNaN(camH) || camH === 0) return { text: `RES: ${resStr}` };

    let targetAspect = 4.0 / 3.0;
    switch (aspectRatio.value) {
      case 0: targetAspect = 4.0 / 3.0; break;
      case 1: targetAspect = 16.0 / 9.0; break;
      case 2: targetAspect = 1.0; break;
      case 3: targetAspect = 3.0 / 2.0; break;
      case 4: targetAspect = 65.0 / 24.0; break;
      default: targetAspect = 4.0 / 3.0; break;
    }

    const camAspect = camW / camH;
    let outW = camW;
    let outH = camH;

    if (targetAspect > camAspect) {
      outH = Math.round(camW / targetAspect);
    } else {
      outW = Math.round(camH * targetAspect);
    }

    return {
      text: `RES: ${outW}x${outH}`,
    };
  });

  return (
    <AnimatedTextInput
      editable={false}
      defaultValue={`RES: ${resolution.value || '-'}`}
      style={styles.text}
      // @ts-expect-error: AnimatedTextInput ref animatedProps type mismatch
      animatedProps={animatedProps}
    />
  );
};

// Helper component to show reanimated values in text
const ReanimatedValueText = <T extends number | string>({ label, value, formatter }: { label: string, value: SharedValue<T>, formatter?: (v: T) => string }) => {
  const animatedProps = useAnimatedProps(() => {
    const displayValue = formatter ? formatter(value.value) : value.value;
    return {
      text: `${label}: ${displayValue}`,
    };
  });

  return (
    <AnimatedTextInput
      editable={false}
      defaultValue={`${label}: -`}
      style={styles.text}
      // @ts-expect-error - 'text' is a native property used by TextInput to avoid re-renders
      animatedProps={animatedProps}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 999,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  text: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    padding: 0,
    margin: 0,
  },
  separator: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
});
