import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { PillButton } from '../pill-button/PillButton';

export interface AutoButtonProps {
  isActive: boolean | SharedValue<boolean>;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean | SharedValue<boolean>;
  opacity?: number | SharedValue<number>;
  isLayoutOverlayEnabled?: boolean;
}

export const AutoButton = ({
  isActive,
  onPress,
  style,
  disabled: _disabled,
  opacity,
  isLayoutOverlayEnabled,
}: AutoButtonProps) => {
  return (
    <PillButton
      label="A"
      isActive={isActive}
      onPress={onPress}
      variant="auto"
      style={[styles.autoButtonWrapper, style]}
      opacity={opacity}
      isLayoutOverlayEnabled={isLayoutOverlayEnabled}
    />
  );
};

const styles = StyleSheet.create({
  autoButtonWrapper: {
    width: 32,
    height: 32,
  },
});
