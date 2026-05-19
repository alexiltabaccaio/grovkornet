import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { ImageSourcePropType } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useParameterGesture } from '@features/camera-controls/lib/useParameterGesture';
import { ParameterThumbView } from '@shared/ui/parameter-thumb';

interface ParameterControlProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  onChange?: (val: number) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  imageSource?: ImageSourcePropType;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: 'square' | 'text' | 'slider';
  isAuto?: SharedValue<boolean>;
  staticText?: string;
  invertDrag?: boolean;
  hideValueInAuto?: boolean;
  autoValueText?: string;
  disabled?: SharedValue<boolean>;
  hideAutoBadge?: boolean;
  isToggle?: boolean;
  centerValue?: number;
  onReset?: () => void;
  onToggleAuto?: (active: boolean) => void;
}

export const ParameterControl = ({
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
  variant = 'square',
  isAuto,
  staticText,
  invertDrag = false,
  hideValueInAuto = false,
  autoValueText = 'AUTO',
  onChange,
  disabled,
  hideAutoBadge = false,
  isToggle = false,
  centerValue,
  onReset,
  onToggleAuto,
}: ParameterControlProps) => {
  const { combinedGesture, isDebugEnabled } = useParameterGesture({
    isActive,
    value,
    minValue,
    maxValue,
    invertDrag,
    onChange,
    onPress,
    isAuto,
    disabled,
    variant,
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
        isDebugEnabled={isDebugEnabled}
        disabled={disabled}
        hideAutoBadge={hideAutoBadge}
        isToggle={isToggle}
        centerValue={centerValue}
        onReset={onReset}
        onToggleAuto={onToggleAuto}
        onPress={onPress}
      />
    </GestureDetector>
  );
};
