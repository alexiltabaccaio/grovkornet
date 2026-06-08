import React, { useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, runOnJS, withTiming, SharedValue } from 'react-native-reanimated';
import { ParameterType } from '../../model/types';
import { WheelItem } from './ParameterWheel';

const ITEM_WIDTH = 120;

interface WheelItemComponentProps {
  item: WheelItem;
  index: number;
  dragX: SharedValue<number>;
  virtualItemsLength: number;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
  setActiveParameter: (param: ParameterType | 'none') => void;
  updateState: (newIndex: number) => void;
}

export const WheelItemComponent = memo(({ 
  item, index, dragX, virtualItemsLength, handlePressWithDouble, setActiveParameter, updateState 
}: WheelItemComponentProps) => {
  const totalWidth = virtualItemsLength * ITEM_WIDTH;
  const halfWidth = totalWidth / 2;

  const animatedStyle = useAnimatedStyle(() => {
    const rawX = (index * ITEM_WIDTH + dragX.value) % totalWidth;
    let x = rawX < 0 ? rawX + totalWidth : rawX;
    
    if (x > halfWidth) x -= totalWidth;
    
    const scale = interpolate(x, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.8, 1.15, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(
      x, 
      [-ITEM_WIDTH * 1.5, -ITEM_WIDTH, 0, ITEM_WIDTH, ITEM_WIDTH * 1.5], 
      [0, 0.4, 1.0, 0.4, 0], 
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: x }, { scale }],
      opacity,
      zIndex: x > -ITEM_WIDTH / 2 && x < ITEM_WIDTH / 2 ? 10 : 1,
    };
  });

  const handleTap = useCallback(() => {
    const currentCenterIdx = Math.round(-dragX.value / ITEM_WIDTH);
    const normalizedCurrent = ((currentCenterIdx % virtualItemsLength) + virtualItemsLength) % virtualItemsLength;
    
    let diff = index - normalizedCurrent;
    if (diff > virtualItemsLength / 2) diff -= virtualItemsLength;
    if (diff < -virtualItemsLength / 2) diff += virtualItemsLength;
    
    const targetGlobalIdx = currentCenterIdx + diff;
    const targetX = -targetGlobalIdx * ITEM_WIDTH;
    
    dragX.value = withTiming(targetX, { duration: 200 });
    runOnJS(updateState)(targetGlobalIdx);
    
    if (diff === 0) {
      if (item.onPress) {
        item.onPress();
      } else {
        handlePressWithDouble(item.id, () => setActiveParameter(item.id));
      }
    }
  }, [dragX, index, virtualItemsLength, updateState, item, handlePressWithDouble, setActiveParameter]);

  return (
    <Animated.View style={[styles.slot, animatedStyle]} pointerEvents="box-none">
      <TouchableOpacity onPress={handleTap} style={styles.pressable} activeOpacity={0.8}>
        <View pointerEvents="none" style={styles.componentWrapper}>
          {item.component}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

WheelItemComponent.displayName = 'WheelItemComponent';

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    width: ITEM_WIDTH,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  componentWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
