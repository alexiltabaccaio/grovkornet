import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, ParameterType, ParameterControl } from '@entities/system';
import { useFilmParameterControlData, FilmParameterType } from '@entities/film';
import { useBodyParameterControlData, BodyParameterType } from '@entities/body';
import { useLensParameterControlData, LensParameterType } from '@entities/lens';

interface SliderDetailPanelProps {
  parameter: ParameterType;
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
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

export const SliderDetailPanel = ({
  parameter,
  parameterDetailPanelAnimatedStyle,
  isActiveOverride,
}: SliderDetailPanelProps) => {
  if (isFilmParameter(parameter)) {
    return (
      <FilmSliderDetailPanel
        parameter={parameter}
        parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
        isActiveOverride={isActiveOverride}
      />
    );
  }

  if (isBodyParameter(parameter)) {
    return (
      <BodySliderDetailPanel
        parameter={parameter}
        parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
        isActiveOverride={isActiveOverride}
      />
    );
  }

  if (isLensParameter(parameter)) {
    return (
      <LensSliderDetailPanel
        parameter={parameter}
        parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
        isActiveOverride={isActiveOverride}
      />
    );
  }

  return null;
};

interface SubSliderProps<T> {
  parameter: T;
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

const FilmSliderDetailPanel = ({
  parameter,
  parameterDetailPanelAnimatedStyle,
  isActiveOverride,
}: SubSliderProps<FilmParameterType>) => {
  const { activeDetailPanel } = useSystemStore(
    useShallow((s) => ({
      activeDetailPanel: s.activeDetailPanel,
    }))
  );

  const controlData = useFilmParameterControlData(parameter);

  const finalIsActive =
    isActiveOverride !== undefined
      ? isActiveOverride
      : parameter === 'grain'
        ? activeDetailPanel === 'grain_intensity'
        : true;

  return (
    <Animated.View style={[styles.parameterDetailPanelContainer, parameterDetailPanelAnimatedStyle]}>
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

const BodySliderDetailPanel = ({
  parameter,
  parameterDetailPanelAnimatedStyle,
  isActiveOverride,
}: SubSliderProps<BodyParameterType>) => {
  const controlData = useBodyParameterControlData(parameter);

  const finalIsActive = isActiveOverride !== undefined ? isActiveOverride : true;

  return (
    <Animated.View style={[styles.parameterDetailPanelContainer, parameterDetailPanelAnimatedStyle]}>
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

const LensSliderDetailPanel = ({
  parameter,
  parameterDetailPanelAnimatedStyle,
  isActiveOverride,
}: SubSliderProps<LensParameterType>) => {
  const controlData = useLensParameterControlData(parameter);

  const finalIsActive = isActiveOverride !== undefined ? isActiveOverride : true;

  return (
    <Animated.View style={[styles.parameterDetailPanelContainer, parameterDetailPanelAnimatedStyle]}>
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
  parameterDetailPanelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 0,
  },
});
