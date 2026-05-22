import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import Animated, { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { useBodyStore } from '@entities/body';
import { useSystemStore } from '@entities/system';
import { Switch, Text } from 'react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const DebugOverlay = () => {
  const fps = useBodyStore(state => state.fps);
  const resolution = useBodyStore(state => state.resolution);
  const isXRayEnabled = useSystemStore(state => state.isXRayEnabled);
  const setIsXRayEnabled = useSystemStore(state => state.setIsXRayEnabled);

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
        <ReanimatedValueText
          label="RES"
          value={resolution}
        />
      </View>
      <View style={[styles.badge, { marginTop: 5 }]} pointerEvents="auto">
        <Text style={styles.text}>X-RAY:</Text>
        <Switch 
          value={isXRayEnabled} 
          onValueChange={setIsXRayEnabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isXRayEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          style={{ transform: [{ scale: 0.6 }], margin: 0, padding: 0 }}
        />
      </View>
    </View>
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
