import React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { ImageSourcePropType } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useParameterGesture } from '../../lib/useParameterGesture';
import { ParameterThumbView, globalMeasuredTrackWidth } from '@shared/ui/parameter-thumb';
import { useSystemStore } from '../../model/useSystemStore';

interface ParameterControlProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  onChange?: (val: number) => void;
  onUpdateWorklet?: (val: number) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  imageSource?: ImageSourcePropType;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: 'text' | 'slider';
  isAuto?: SharedValue<boolean>;
  staticText?: string;
  invertDrag?: boolean;
  hideValueInAuto?: boolean;
  autoValueText?: string;
  disabled?: SharedValue<boolean>;
  isToggle?: boolean;
  centerValue?: number;
  onReset?: () => void;
  onToggleAuto?: (active: boolean) => void;
  hideDebugRectangles?: boolean;
  disableGestures?: boolean;
  hideAutoPlaceholder?: boolean;
  sliderColor?: string;
  sliderTrackWidth?: SharedValue<number>;
  parameterId?: string;
  isMainSlider?: boolean;
}

const StaticParameterControl = React.memo((props: ParameterControlProps) => {
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);
  const fallbackTrackWidth = useSharedValue(globalMeasuredTrackWidth);
  const effectiveTrackWidth = props.sliderTrackWidth || fallbackTrackWidth;
  
  return (
    <ParameterThumbView
      label={props.label}
      isActive={props.isActive}
      value={props.value}
      minValue={props.minValue}
      maxValue={props.maxValue}
      icon={props.icon}
      imageSource={props.imageSource}
      renderValue={props.renderValue}
      valueFormatter={props.valueFormatter}
      variant={props.variant}
      isAuto={props.isAuto}
      staticText={props.staticText}
      hideValueInAuto={props.hideValueInAuto}
      autoValueText={props.autoValueText}
      isLayoutOverlayEnabled={!props.hideDebugRectangles && isLayoutOverlayEnabled}
      disabled={props.disabled}
      isToggle={props.isToggle}
      centerValue={props.centerValue}
      onReset={props.onReset}
      onToggleAuto={props.onToggleAuto}
      onPress={props.onPress}
      hideAutoPlaceholder={props.hideAutoPlaceholder}
      sliderTrackWidth={effectiveTrackWidth}
      sliderColor={props.sliderColor}
      parameterId={props.parameterId}
      isMainSlider={props.isMainSlider}
    />
  );
});

StaticParameterControl.displayName = 'StaticParameterControl';

export const ParameterControl = React.memo((props: ParameterControlProps) => {
  const {
    label,
    isActive,
    onPress,
    value,
    minValue = 0,
    maxValue = 1,
    icon,
    imageSource,
    renderValue,
    valueFormatter,
    variant = 'text',
    isAuto,
    staticText,
    invertDrag = false,
    hideValueInAuto = false,
    autoValueText = 'AUTO',
    onChange,
    onUpdateWorklet,
    disabled,
    isToggle = false,
    centerValue,
    onReset,
    onToggleAuto,
    hideDebugRectangles = false,
    disableGestures = false,
    hideAutoPlaceholder,
    sliderColor,
    parameterId,
    isMainSlider,
  } = props;

  if (disableGestures) {
    return <StaticParameterControl {...props} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { combinedGesture, isLayoutOverlayEnabled, effectiveTrackWidth } = useParameterGesture({
    isActive,
    value,
    minValue,
    maxValue,
    invertDrag,
    onChange,
    onUpdateWorklet,
    onPress,
    isAuto,
    disabled,
    variant,
    hideAutoPlaceholder,
    onReset,
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <ParameterThumbView
        label={label}
        isActive={isActive}
        value={value}
        minValue={minValue}
        maxValue={maxValue}
        icon={icon}
        imageSource={imageSource}
        renderValue={renderValue}
        valueFormatter={valueFormatter}
        variant={variant}
        isAuto={isAuto}
        staticText={staticText}
        hideValueInAuto={hideValueInAuto}
        autoValueText={autoValueText}
        isLayoutOverlayEnabled={!hideDebugRectangles && isLayoutOverlayEnabled}
        disabled={disabled}
        isToggle={isToggle}
        centerValue={centerValue}
        onReset={onReset}
        onToggleAuto={onToggleAuto}
        onPress={onPress}
        hideAutoPlaceholder={hideAutoPlaceholder}
        sliderTrackWidth={effectiveTrackWidth}
        sliderColor={sliderColor}
        parameterId={parameterId}
        isMainSlider={isMainSlider}
      />
    </GestureDetector>
  );
});

ParameterControl.displayName = 'ParameterControl';
