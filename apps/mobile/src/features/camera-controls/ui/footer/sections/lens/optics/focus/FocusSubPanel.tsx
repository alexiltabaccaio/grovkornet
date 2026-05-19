import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface FocusSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const formatFocus = (v: number) => {
  'worklet';
  if (v <= 0.1) return '∞';
  
  const distanceInMeters = 1 / v;
  if (distanceInMeters >= 1) {
    return `${distanceInMeters.toFixed(1)}m`;
  } else {
    return `${((distanceInMeters * 100)).toFixed(0)}cm`;
  }
};

export const FocusSubPanel = ({ parameterExtensionAnimatedStyle }: FocusSubPanelProps) => {
  const { focusDistance, setFocusDistance, focusAuto, setFocusAuto } = useHardwareStore(useShallow(state => ({
    focusDistance: state.focusDistance,
    setFocusDistance: state.setFocusDistance,
    focusAuto: state.focusAuto,
    setFocusAuto: state.setFocusAuto,
  })));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={focusDistance}
          minValue={0}
          maxValue={10}
          onChange={setFocusDistance}
          variant="slider"
          isAuto={focusAuto}
          valueFormatter={formatFocus}
          hideValueInAuto={true}
          autoValueText="AF"
          onReset={() => setFocusAuto(true)}
          onToggleAuto={setFocusAuto}
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
