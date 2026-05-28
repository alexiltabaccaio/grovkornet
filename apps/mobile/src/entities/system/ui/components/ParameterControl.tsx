import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { ImageSourcePropType } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useParameterGesture } from '../../lib/useParameterGesture';
import { ParameterThumbView } from '@shared/ui/parameter-thumb';

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
}

export const ParameterControl = React.memo(({
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
}: ParameterControlProps) => {
  const { combinedGesture, isDebugEnabled, effectiveTrackWidth } = useParameterGesture({
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

  if (disableGestures) {
    return (
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
        isDebugEnabled={!hideDebugRectangles && isDebugEnabled}
        disabled={disabled}
        isToggle={isToggle}
        centerValue={centerValue}
        onReset={onReset}
        onToggleAuto={onToggleAuto}
        onPress={onPress}
        hideAutoPlaceholder={hideAutoPlaceholder}
        sliderTrackWidth={effectiveTrackWidth}
        sliderColor={sliderColor}
      />
    );
  }

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
        isDebugEnabled={!hideDebugRectangles && isDebugEnabled}
        disabled={disabled}
        isToggle={isToggle}
        centerValue={centerValue}
        onReset={onReset}
        onToggleAuto={onToggleAuto}
        onPress={onPress}
        hideAutoPlaceholder={hideAutoPlaceholder}
        sliderTrackWidth={effectiveTrackWidth}
        sliderColor={sliderColor}
      />
    </GestureDetector>
  );
});

ParameterControl.displayName = 'ParameterControl';
// @ts-expect-error - whyDidYouRender is a property dynamically read by why-did-you-render in development
ParameterControl.whyDidYouRender = true;
