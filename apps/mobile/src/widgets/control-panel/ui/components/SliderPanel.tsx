import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, ParameterType, ParameterControl, ParameterPanelWrapper } from '@entities/system';
import { useFilmParameterControlData, FilmParameterType } from '@entities/film';
import { useBodyParameterControlData, BodyParameterType } from '@entities/body';
import { useLensParameterControlData, LensParameterType } from '@entities/lens';

interface SliderPanelProps {
  parameter: ParameterType;
  animatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

const isFilmParameter = (p: ParameterType): p is FilmParameterType => {
  return [
    'grain',
    'sharpening',
    'saturation',
    'hue',
    'contrast',
    'blackLevel',
    'highlights',
    'pivot',
    'chromatic_aberration',
    'bloom',
    'temperature',
    'tint',
    'pixelation',
    'vignette',
    'chroma_shift',
    'tape_jitter',
    'scanlines',
  ].includes(p);
};

const isBodyParameter = (p: ParameterType): p is BodyParameterType => {
  return ['ev', 'iso', 'shutter_speed', 'zoom'].includes(p);
};

const isLensParameter = (p: ParameterType): p is LensParameterType => {
  return p === 'focus';
};

const NOOP = () => {};

export const SliderPanel = React.memo(({
  parameter,
  animatedStyle,
  isActiveOverride,
}: SliderPanelProps) => {
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
    <ParameterPanelWrapper animatedStyle={animatedStyle}>
      <ParameterControl
        key={parameter}
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
