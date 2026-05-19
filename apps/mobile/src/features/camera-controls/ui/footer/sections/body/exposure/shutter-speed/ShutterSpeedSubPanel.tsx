import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface ShutterSpeedSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const formatShutterSpeed = (v: number) => {
  'worklet';
  return `1/${Math.round(v)}`;
};

export const ShutterSpeedSubPanel = ({ parameterExtensionAnimatedStyle }: ShutterSpeedSubPanelProps) => {
  const { shutterSpeed, setShutterSpeed, shutterSpeedAuto, setShutterSpeedAuto } = useHardwareStore(useShallow(state => ({
    shutterSpeed: state.shutterSpeed,
    setShutterSpeed: state.setShutterSpeed,
    shutterSpeedAuto: state.shutterSpeedAuto,
    setShutterSpeedAuto: state.setShutterSpeedAuto,
  })));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={shutterSpeed}
          minValue={1}
          maxValue={1000}
          onChange={setShutterSpeed}
          variant="slider"
          isAuto={shutterSpeedAuto}
          valueFormatter={formatShutterSpeed}
          hideValueInAuto={true}
          autoValueText="AUTO"
          onReset={() => setShutterSpeedAuto(true)}
          onToggleAuto={setShutterSpeedAuto}
        />
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
});
