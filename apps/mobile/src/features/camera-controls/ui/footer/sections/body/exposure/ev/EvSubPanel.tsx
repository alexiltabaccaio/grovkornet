import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface EvSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const formatEv = (v: number) => {
  'worklet';
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
};

export const EvSubPanel = ({ parameterExtensionAnimatedStyle }: EvSubPanelProps) => {
  const { ev, setEv, isoAuto, shutterSpeedAuto } = useHardwareStore(useShallow(state => ({
    ev: state.ev,
    setEv: state.setEv,
    isoAuto: state.isoAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
  })));

  const isEvDisabled = useDerivedValue(() => {
    return !isoAuto.value && !shutterSpeedAuto.value;
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={ev}
          minValue={-2.0}
          maxValue={2.0}
          centerValue={0.0}
          onChange={setEv}
          variant="slider"
          valueFormatter={formatEv}
          onReset={() => setEv(0)}
          disabled={isEvDisabled}
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
