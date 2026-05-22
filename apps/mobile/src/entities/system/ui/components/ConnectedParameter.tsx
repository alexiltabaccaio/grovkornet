import React, { memo } from 'react';
import { useSystemStore } from '../../model/useSystemStore';
import { ParameterType } from '../../model/types';
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
  onUpdateWorklet?: (val: number) => void;
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
  isToggle?: boolean;
  centerValue?: number;
  onReset?: () => void;
  onToggleAuto?: (active: boolean) => void;
  disableGestures?: boolean;
}

export const ConnectedParameter = memo(({
  id,
  label,
  handlePressWithDouble,
  isActive,
  onPress,
  ...rest
}: ConnectedParameterProps) => {
  const isActiveSelected = useSystemStore(s => s.activeParameter === id);
  const setActiveParameter = useSystemStore(s => s.setActiveParameter);

  const finalIsActive = isActive !== undefined ? isActive : isActiveSelected;

  const finalOnPress = onPress !== undefined ? onPress : () => {
    if (handlePressWithDouble) {
      handlePressWithDouble(id, () => {
        setActiveParameter(id);
      });
    } else {
      setActiveParameter(id);
    }
  };

  return (
    <ParameterControl
      label={label}
      isActive={finalIsActive}
      onPress={finalOnPress}
      disableGestures={rest.disableGestures}
      {...rest}
    />
  );
});

ConnectedParameter.displayName = 'ConnectedParameter';
