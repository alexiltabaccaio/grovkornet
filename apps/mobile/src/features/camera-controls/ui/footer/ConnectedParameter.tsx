import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from './ParameterControl';
import { Ionicons } from '@expo/vector-icons';
import { ImageSourcePropType } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export interface ConnectedParameterProps {
  id: ParameterType;
  label: string;
  handlePressWithDouble?: (param: ParameterType, action: () => void) => void;
  isActive?: boolean;
  onPress?: () => void;
  
  // Forwarded props for custom styling and gestures
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

export const ConnectedParameter = ({
  id,
  label,
  handlePressWithDouble,
  isActive,
  onPress,
  ...rest
}: ConnectedParameterProps) => {
  const { activeParameter, setActiveParameter } = useUIStore(useShallow(s => ({
    activeParameter: s.activeParameter,
    setActiveParameter: s.setActiveParameter,
  })));

  const finalIsActive = isActive !== undefined ? isActive : activeParameter === id;

  const finalOnPress = onPress !== undefined ? onPress : () => {
    if (handlePressWithDouble) {
      handlePressWithDouble(id, () => {
        setActiveParameter(activeParameter === id ? 'none' : id);
      });
    } else {
      setActiveParameter(activeParameter === id ? 'none' : id);
    }
  };

  return (
    <ParameterControl
      label={label}
      isActive={finalIsActive}
      onPress={finalOnPress}
      {...rest}
    />
  );
};
