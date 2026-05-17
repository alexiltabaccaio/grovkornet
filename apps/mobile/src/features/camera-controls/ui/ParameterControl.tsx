import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useParameterGesture } from '../lib/useParameterGesture';
import { ParameterThumbView } from './ParameterThumbView';

interface ParameterControlProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  onChange?: (val: number) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: 'square' | 'text';
  isAuto?: SharedValue<boolean>;
  onLongPress?: () => void;
  staticText?: string;
  invertDrag?: boolean;
  hideValueInAuto?: boolean;
  autoValueText?: string;
}

export const ParameterControl = ({
  label,
  isActive,
  onPress,
  value,
  minValue = 0,
  maxValue = 1,
  icon,
  renderValue,
  valueFormatter,
  variant = 'square',
  isAuto,
  onLongPress,
  staticText,
  invertDrag = false,
  hideValueInAuto = false,
  autoValueText = 'AUTO',
  onChange,
}: ParameterControlProps) => {
  const { combinedGesture, isDebugEnabled } = useParameterGesture({
    isActive,
    value,
    minValue,
    maxValue,
    invertDrag,
    onChange,
    onPress,
    onLongPress,
    isAuto,
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
        renderValue={renderValue}
        valueFormatter={valueFormatter}
        variant={variant}
        isAuto={isAuto}
        staticText={staticText}
        hideValueInAuto={hideValueInAuto}
        autoValueText={autoValueText}
        isDebugEnabled={isDebugEnabled}
      />
    </GestureDetector>
  );
};
