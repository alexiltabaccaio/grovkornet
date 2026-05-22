import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, ParameterType, ParameterControl } from '@entities/system';
import { useFilmParameterControlData, FilmParameterType } from '@entities/film';
import { useBodyParameterControlData, BodyParameterType } from '@entities/body';
import { useLensParameterControlData, LensParameterType } from '@entities/lens';

interface SliderExtensionProps {
  parameter: ParameterType;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

const isFilmParameter = (p: ParameterType): p is FilmParameterType => {
  return [
    'grain',
    'sharpening',
    'saturation',
    'contrast',
    'chromatic_aberration',
    'bloom',
    'temperature',
    'tint',
  ].includes(p);
};

const isBodyParameter = (p: ParameterType): p is BodyParameterType => {
  return ['ev', 'iso', 'shutter_speed'].includes(p);
};

const isLensParameter = (p: ParameterType): p is LensParameterType => {
  return p === 'focus';
};

export const SliderExtension = ({
  parameter,
  parameterExtensionAnimatedStyle,
  isActiveOverride,
}: SliderExtensionProps) => {
  if (isFilmParameter(parameter)) {
    return (
      <FilmSliderExtension
        parameter={parameter}
        parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
        isActiveOverride={isActiveOverride}
      />
    );
  }

  if (isBodyParameter(parameter)) {
    return (
      <BodySliderExtension
        parameter={parameter}
        parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
        isActiveOverride={isActiveOverride}
      />
    );
  }

  if (isLensParameter(parameter)) {
    return (
      <LensSliderExtension
        parameter={parameter}
        parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
        isActiveOverride={isActiveOverride}
      />
    );
  }

  return null;
};

interface SubSliderProps<T> {
  parameter: T;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

const FilmSliderExtension = ({
  parameter,
  parameterExtensionAnimatedStyle,
  isActiveOverride,
}: SubSliderProps<FilmParameterType>) => {
  const { activeExtension } = useSystemStore(
    useShallow((s) => ({
      activeExtension: s.activeExtension,
    }))
  );

  const controlData = useFilmParameterControlData(parameter);

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

const BodySliderExtension = ({
  parameter,
  parameterExtensionAnimatedStyle,
  isActiveOverride,
}: SubSliderProps<BodyParameterType>) => {
  const controlData = useBodyParameterControlData(parameter);

  const finalIsActive = isActiveOverride !== undefined ? isActiveOverride : true;

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

const LensSliderExtension = ({
  parameter,
  parameterExtensionAnimatedStyle,
  isActiveOverride,
}: SubSliderProps<LensParameterType>) => {
  const controlData = useLensParameterControlData(parameter);

  const finalIsActive = isActiveOverride !== undefined ? isActiveOverride : true;

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
