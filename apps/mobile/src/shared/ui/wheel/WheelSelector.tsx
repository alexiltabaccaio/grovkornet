import React, { useRef, useCallback, useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useInteractionContext } from '@shared/lib';

const ITEM_WIDTH = 120;

export interface GenericWheelItem<T = string> {
  id: T;
  component: React.ReactNode;
  onPress?: () => void;
}

interface WheelSelectorProps<T> {
  items: GenericWheelItem<T>[];
  activeId: T;
  onChangeActiveId: (id: T) => void;
  handlePressWithDouble?: (id: T, action: () => void) => void;
}

const WheelItemComponent = memo(({
  item,
  index,
  dragX,
  virtualItemsLength,
  handlePressWithDouble,
  onChangeActiveId,
  updateState,
}: {
  item: GenericWheelItem<unknown>;
  index: number;
  dragX: SharedValue<number>;
  virtualItemsLength: number;
  handlePressWithDouble?: (id: unknown, action: () => void) => void;
  onChangeActiveId: (id: unknown) => void;
  updateState: (newIndex: number) => void;
}) => {
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
      } else if (handlePressWithDouble) {
        handlePressWithDouble(item.id, () => onChangeActiveId(item.id));
      } else {
        onChangeActiveId(item.id);
      }
    }
  }, [dragX, index, virtualItemsLength, updateState, item, handlePressWithDouble, onChangeActiveId]);

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

// We cast the memo function to properly support generics in TypeScript
const WheelSelectorComponent = memo(<T,>({
  items,
  activeId,
  onChangeActiveId,
  handlePressWithDouble,
}: WheelSelectorProps<T>) => {
  const itemsLength = items.length;
  const itemsLengthSV = useSharedValue(itemsLength);
  const { isInteractable } = useInteractionContext();

  React.useEffect(() => {
    itemsLengthSV.value = itemsLength;
  }, [itemsLength, itemsLengthSV]);
  
  const virtualItems = useMemo(() => {
    if (items.length < 2) return items;
    let duplicated = [...items];
    while (duplicated.length < 5) {
      duplicated = [...duplicated, ...items];
    }
    return duplicated;
  }, [items]);

  const virtualItemsLength = virtualItems.length;

  const initialIndex = Math.max(0, items.findIndex(item => item.id === activeId));
  
  const dragX = useSharedValue(-initialIndex * ITEM_WIDTH);
  const startX = useSharedValue(0);
  const hasWarnedWheelNaN = useSharedValue(false);

  const lastActiveRef = useRef(activeId);
  
  // Synchronize external state changes (e.g., click on reset buttons)
  if (activeId !== lastActiveRef.current) {
    lastActiveRef.current = activeId;
    const newIdx = items.findIndex(item => item.id === activeId);
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
      onChangeActiveId(param);
    }
  }, [items, itemsLength, onChangeActiveId]);

  // Trigger state update DURING rotation, as soon as we cross the halfway point of a parameter
  useAnimatedReaction(
    () => Math.round(-dragX.value / ITEM_WIDTH),
    (currentIndex, previousIndex) => {
      if (previousIndex !== null && currentIndex !== previousIndex) {
        runOnJS(updateState)(currentIndex);
      }
    },
    [updateState]
  );

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(isInteractable)
      .activeOffsetX([-10, 10])
      .failOffsetY([-10, 10])
      .onStart(() => {
        startX.value = dragX.value;
      })
      .onUpdate((event) => {
        if (itemsLengthSV.value < 2) return;
        const tx = event.translationX ?? 0;
        if (isNaN(tx) || isNaN(startX.value)) {
          if (__DEV__ && !hasWarnedWheelNaN.value) {
            hasWarnedWheelNaN.value = true;
            console.warn(`[Gesture Warning]: translationX or startX is NaN in WheelSelector`);
          }
          return;
        }
        dragX.value = startX.value + tx;
      })
      .onEnd((event) => {
        if (itemsLengthSV.value < 2) return;
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
  }, [isInteractable, dragX, startX, hasWarnedWheelNaN, itemsLengthSV]);

  if (itemsLength === 0) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {virtualItems.map((item, i) => (
          <WheelItemComponent
            key={`${String(item.id)}-${i}`}
            item={item as GenericWheelItem<unknown>}
            index={i}
            dragX={dragX}
            virtualItemsLength={virtualItemsLength}
            handlePressWithDouble={handlePressWithDouble as ((id: unknown, action: () => void) => void) | undefined}
            onChangeActiveId={onChangeActiveId as (id: unknown) => void}
            updateState={updateState}
          />
        ))}
      </View>
    </GestureDetector>
  );
});

WheelSelectorComponent.displayName = 'WheelSelector';

export const WheelSelector = WheelSelectorComponent as <T>(props: WheelSelectorProps<T>) => React.ReactElement | null;

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
