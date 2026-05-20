import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';


import { ParameterControl } from './ParameterControl';
import { ParameterType } from '@shared/types/camera';
import { useParameterControlData } from '@features/camera-controls/lib/useParameterControlData';


interface SliderExtensionProps {
  parameter: ParameterType;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

export const SliderExtension = ({
  parameter,
  parameterExtensionAnimatedStyle,
  isActiveOverride,
}: SliderExtensionProps) => {
  const { activeExtension } = useUIStore(
    useShallow((s) => ({
      activeExtension: s.activeExtension,
    }))
  );

  const controlData = useParameterControlData(parameter);

  if (!controlData) {
    return null;
  }

  const finalIsActive =
    isActiveOverride !== undefined
      ? isActiveOverride
      : parameter === 'grain'
        ? activeExtension === 'grain_intensity'
        : true;

  return (
    <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
      <ParameterControl
        label=""
        isActive={finalIsActive}
        onPress={() => { }}
        value={controlData.value}
        minValue={controlData.minValue}
        maxValue={controlData.maxValue}
        centerValue={controlData.centerValue}
        onChange={controlData.onChange}
        onUpdateWorklet={controlData.onUpdateWorklet}
        variant="slider"
        isAuto={controlData.isAuto}
        valueFormatter={controlData.valueFormatter}
        hideValueInAuto={controlData.hideValueInAuto}
        autoValueText={controlData.autoValueText}
        onReset={controlData.onReset}
        onToggleAuto={controlData.onToggleAuto}
        disabled={controlData.disabled}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 0,
  },
});
