import React, { useRef, useCallback, useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { WheelItemComponent } from './WheelItemComponent';
import type { WheelItem } from './WheelItemComponent';
export type { WheelItem };
import { ParameterType } from '../../model/types';
const ITEM_WIDTH = 120;

interface ParameterWheelProps {
  items: WheelItem[];
  activeParameter: ParameterType | 'none';
  setActiveParameter: (param: ParameterType | 'none') => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ParameterWheel = memo(({
  items,
  activeParameter,
  setActiveParameter,
  handlePressWithDouble,
  }: ParameterWheelProps) => {
  const itemsLength = items.length;
  
  const virtualItems = useMemo(() => {
    if (items.length < 2) return items;
    let duplicated = [...items];
    while (duplicated.length < 5) {
      duplicated = [...duplicated, ...items];
    }
    return duplicated;
  }, [items]);

  const virtualItemsLength = virtualItems.length;

  const initialIndex = Math.max(0, items.findIndex(item => item.id === activeParameter));
  
  const dragX = useSharedValue(-initialIndex * ITEM_WIDTH);
  const startX = useSharedValue(0);

  const lastActiveRef = useRef(activeParameter);
  
  // Synchronize external state changes (e.g., click on reset buttons)
  if (activeParameter !== lastActiveRef.current) {
    lastActiveRef.current = activeParameter;
    const newIdx = items.findIndex(item => item.id === activeParameter);
    if (newIdx !== -1 && itemsLength > 0) {
      const currentCenterIdx = Math.round(-dragX.value / ITEM_WIDTH);
      const normalizedCurrent = ((currentCenterIdx % itemsLength) + itemsLength) % itemsLength;
      
      if (normalizedCurrent !== newIdx) {
        let diff = newIdx - normalizedCurrent;
        if (diff > itemsLength / 2) diff -= itemsLength;
        if (diff < -itemsLength / 2) diff += itemsLength;
        
        dragX.value = withTiming(dragX.value - diff * ITEM_WIDTH, { duration: 250 });
      }
    }
  }

  const updateState = useCallback((newIndex: number) => {
    if (itemsLength === 0) return;
    const normalized = ((newIndex % itemsLength) + itemsLength) % itemsLength;
    const param = items[normalized]?.id;
    if (param && param !== lastActiveRef.current) {
      lastActiveRef.current = param;
      setActiveParameter(param);
    }
  }, [items, itemsLength, setActiveParameter]);

  // Trigger state update DURING rotation, as soon as we cross the halfway point of a parameter
  useAnimatedReaction(
    () => Math.round(-dragX.value / ITEM_WIDTH),
    (currentIndex, previousIndex) => {
      if (previousIndex !== null && currentIndex !== previousIndex) {
        runOnJS(updateState)(currentIndex);
      }
    }
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      startX.value = dragX.value;
    })
    .onUpdate((event) => {
      if (itemsLength < 2) return;
      dragX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      if (itemsLength < 2) return;
      const velocity = event.velocityX;
      const dx = dragX.value - startX.value;
      
      const startIndex = Math.round(-startX.value / ITEM_WIDTH);
      let targetIndex = startIndex;

      // If there is intentional movement or velocity, shift exactly by 1 parameter
      if (dx < -30 || velocity < -400) {
        targetIndex = startIndex + 1;
      } else if (dx > 30 || velocity > 400) {
        targetIndex = startIndex - 1;
      }

      const targetX = -targetIndex * ITEM_WIDTH;
      dragX.value = withTiming(targetX, { duration: 250 });
    });

  if (itemsLength === 0) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {virtualItems.map((item, i) => (
          <WheelItemComponent 
            key={`${item.id}-${i}`}
            item={item}
            index={i}
            dragX={dragX}
            virtualItemsLength={virtualItemsLength}
            handlePressWithDouble={handlePressWithDouble}
            setActiveParameter={setActiveParameter}
            updateState={updateState}
          />
        ))}
      </View>
    </GestureDetector>
  );
});

ParameterWheel.displayName = 'ParameterWheel';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
