import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useControlPanelStore, ParameterType, ParameterControl, ParameterPanelWrapper } from '@entities/system';
import { useFilmParameterControlData, FilmParameterType, FILM_PARAMETERS } from '@entities/film';
import { useBodyParameterControlData, BodyParameterType, BODY_PARAMETERS } from '@entities/body';
import { useLensParameterControlData, LensParameterType, LENS_PARAMETERS } from '@entities/lens';

interface SliderPanelProps {
  parameter: ParameterType;
  animatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

const isFilmParameter = (p: ParameterType): p is FilmParameterType => {
  return (FILM_PARAMETERS as readonly string[]).includes(p);
};

const isBodyParameter = (p: ParameterType): p is BodyParameterType => {
  return (BODY_PARAMETERS as readonly string[]).includes(p);
};

const isLensParameter = (p: ParameterType): p is LensParameterType => {
  return (LENS_PARAMETERS as readonly string[]).includes(p);
};

const NOOP = () => {};

export const SliderPanel = React.memo(({
  parameter,
  animatedStyle,
  isActiveOverride,
}: SliderPanelProps) => {
  const { activeDetailPanel } = useControlPanelStore(
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
    <ParameterPanelWrapper animatedStyle={animatedStyle}>
      <ParameterControl
        parameterId={parameter}
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
        isMainSlider={true}
      />
    </ParameterPanelWrapper>
  );
});

SliderPanel.displayName = 'SliderPanel';
