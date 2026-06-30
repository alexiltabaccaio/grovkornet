import React, { useCallback, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface ColorCircleProps {
  itemKey: string;
  index: number;
  isActive: boolean;
  color: string;
  onPress: (key: string, index: number) => void;
}

export const ColorCircle = memo(({ itemKey, index, isActive, color, onPress }: ColorCircleProps) => {
  const handlePress = useCallback(() => {
    onPress(itemKey, index);
  }, [itemKey, index, onPress]);

  return (
    <TouchableOpacity
      testID={`color-circle-${itemKey}`}
      onPress={handlePress}
      style={[styles.circleContainer, isActive && styles.circleContainerActive]}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
    >
      <View style={[styles.circle, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
});

ColorCircle.displayName = 'ColorCircle';

const styles = StyleSheet.create({
  circleContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainerActive: {
    borderColor: '#FFFFFF',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
