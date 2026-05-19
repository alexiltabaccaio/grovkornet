import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import { ParameterType } from '@shared/types/camera';

const ITEM_WIDTH = 120;

export interface WheelItem {
  id: ParameterType;
  component: React.ReactNode;
  onPress?: () => void;
}

interface ParameterWheelProps {
  items: WheelItem[];
  activeParameter: ParameterType | 'none';
  setActiveParameter: (param: ParameterType | 'none') => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ParameterWheel = ({
  items,
  activeParameter,
  setActiveParameter,
  handlePressWithDouble,
}: ParameterWheelProps) => {
  const itemsKey = items.map(item => item.id).join(',');
  const [centeredParam, setCenteredParam] = useState<ParameterType>(
    activeParameter !== 'none' && items.some(i => i.id === activeParameter)
      ? activeParameter
      : items[0]?.id
  );

  const [prevActiveParameter, setPrevActiveParameter] = useState(activeParameter);
  const [prevItemsKey, setPrevItemsKey] = useState(itemsKey);

  if (activeParameter !== prevActiveParameter || itemsKey !== prevItemsKey) {
    setPrevActiveParameter(activeParameter);
    setPrevItemsKey(itemsKey);
    if (activeParameter !== 'none' && items.some(i => i.id === activeParameter)) {
      setCenteredParam(activeParameter);
    } else if (items.length > 0 && !items.some(i => i.id === centeredParam)) {
      setCenteredParam(items[0].id);
    }
  }

  const centerIndex = items.findIndex(item => item.id === centeredParam);
  const leftIndex = items.length >= 2 ? (centerIndex - 1 + items.length) % items.length : -1;
  const rightIndex = items.length >= 2 ? (centerIndex + 1) % items.length : -1;

  const dragX = useSharedValue(0);
  const pendingAnimation = useRef<number | null>(null);

  // Reset dragX in perfetta sincronia con il commit di React per evitare il flicker visivo
  useLayoutEffect(() => {
    if (pendingAnimation.current !== null) {
      dragX.value = pendingAnimation.current;
      dragX.value = withTiming(0, { duration: 250 });
      pendingAnimation.current = null;
    } else {
      dragX.value = 0;
    }
  }, [itemsKey, centeredParam, dragX]);

  const performEarlySwap = useCallback((targetParam: ParameterType, startDragX: number) => {
    pendingAnimation.current = startDragX;
    setActiveParameter(targetParam);
  }, [setActiveParameter]);

  const handleTapLeft = () => {
    if (leftIndex === -1) return;
    performEarlySwap(items[leftIndex].id, -ITEM_WIDTH);
  };

  const handleTapRight = () => {
    if (rightIndex === -1) return;
    performEarlySwap(items[rightIndex].id, ITEM_WIDTH);
  };

  const handleTapCenter = () => {
    const item = items[centerIndex];
    if (item.onPress) {
      item.onPress();
    } else {
      handlePressWithDouble(item.id, () => {
        setActiveParameter(item.id);
      });
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (items.length < 2) return;
      dragX.value = Math.max(-ITEM_WIDTH, Math.min(ITEM_WIDTH, event.translationX));
    })
    // eslint-disable-next-line react-hooks/refs
    .onEnd((event) => {
      if (items.length < 2) return;
      const threshold = ITEM_WIDTH / 3;
      const velocity = event.velocityX;

      if (dragX.value < -threshold || velocity < -400) {
        // Dragged left -> select Right item
        runOnJS(performEarlySwap)(items[rightIndex].id, dragX.value + ITEM_WIDTH);
      } else if (dragX.value > threshold || velocity > 400) {
        // Dragged right -> select Left item
        runOnJS(performEarlySwap)(items[leftIndex].id, dragX.value - ITEM_WIDTH);
      } else {
        dragX.value = withTiming(0, { duration: 200 });
      }
    });

  // Calculate animated position for each slot
  const leftPosition = useDerivedValue(() => -ITEM_WIDTH + dragX.value);
  const centerPosition = useDerivedValue(() => dragX.value);
  const rightPosition = useDerivedValue(() => ITEM_WIDTH + dragX.value);

  const leftAnimatedStyle = useAnimatedStyle(() => {
    const pos = leftPosition.value;
    const scale = interpolate(pos, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.8, 1.15, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(pos, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.4, 1.0, 0.4], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: pos }, { scale }],
      opacity,
    };
  });

  const centerAnimatedStyle = useAnimatedStyle(() => {
    const pos = centerPosition.value;
    const scale = interpolate(pos, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.8, 1.15, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(pos, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.4, 1.0, 0.4], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: pos }, { scale }],
      opacity,
    };
  });

  const rightAnimatedStyle = useAnimatedStyle(() => {
    const pos = rightPosition.value;
    const scale = interpolate(pos, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.8, 1.15, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(pos, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.4, 1.0, 0.4], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: pos }, { scale }],
      opacity,
    };
  });

  if (items.length === 0) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {leftIndex !== -1 && (
          <Animated.View 
            style={[styles.slot, leftAnimatedStyle]} 
            pointerEvents="box-none"
          >
            <Pressable onPress={handleTapLeft} style={styles.pressable} pointerEvents="auto">
              <View pointerEvents="none" style={styles.componentWrapper}>
                {items[leftIndex].component}
              </View>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View 
          style={[styles.slot, centerAnimatedStyle]} 
          pointerEvents="box-none"
        >
          <Pressable onPress={handleTapCenter} style={styles.pressable} pointerEvents="auto">
            <View pointerEvents="none" style={styles.componentWrapper}>
              {items[centerIndex].component}
            </View>
          </Pressable>
        </Animated.View>

        {rightIndex !== -1 && (
          <Animated.View 
            style={[styles.slot, rightAnimatedStyle]} 
            pointerEvents="box-none"
          >
            <Pressable onPress={handleTapRight} style={styles.pressable} pointerEvents="auto">
              <View pointerEvents="none" style={styles.componentWrapper}>
                {items[rightIndex].component}
              </View>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
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
