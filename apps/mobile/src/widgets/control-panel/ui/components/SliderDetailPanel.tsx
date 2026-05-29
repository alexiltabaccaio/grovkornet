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
    'blackLevel',
    'highlights',
    'pivot',
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

const NOOP = () => {};

export const SliderDetailPanel = ({
  parameter,
  parameterDetailPanelAnimatedStyle,
  isActiveOverride,
}: SliderDetailPanelProps) => {
  const { activeDetailPanel } = useSystemStore(
    useShallow((s) => ({
      activeDetailPanel: s.activeDetailPanel,
    }))
  );

  const filmParam = isFilmParameter(parameter) ? parameter : 'grain';
  const bodyParam = isBodyParameter(parameter) ? parameter : 'ev';
  const lensParam = isLensParameter(parameter) ? parameter : 'focus';

  const filmData = useFilmParameterControlData(filmParam);
  const bodyData = useBodyParameterControlData(bodyParam);
  const lensData = useLensParameterControlData(lensParam);

  if (!isFilmParameter(parameter) && !isBodyParameter(parameter) && !isLensParameter(parameter)) {
    return null;
  }

  const controlData = isFilmParameter(parameter)
    ? filmData
    : isBodyParameter(parameter)
      ? bodyData
      : lensData;

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
        onPress={NOOP}
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
