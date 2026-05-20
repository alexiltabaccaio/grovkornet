import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  runOnJS,
  useAnimatedReaction,
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
  const itemsLength = items.length;
  const initialIndex = Math.max(0, items.findIndex(item => item.id === activeParameter));
  
  const dragX = useSharedValue(-initialIndex * ITEM_WIDTH);
  const startX = useSharedValue(0);

  const lastActiveRef = useRef(activeParameter);
  
  // Sincronizza cambiamenti di stato esterni (es. click su bottoni di reset)
  // eslint-disable-next-line react-hooks/refs
  if (activeParameter !== lastActiveRef.current) {
    // eslint-disable-next-line react-hooks/refs
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
      console.log(`[ParameterWheel] 🔄 Aggiornamento in corsa: ${param}`);
      lastActiveRef.current = param;
      setActiveParameter(param);
    }
  }, [items, itemsLength, setActiveParameter]);

  // Trigger state update DURANTE la rotazione, appena si supera la metà di un parametro
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

      // Se c'è un movimento o una velocità intenzionale, spostiamo esattamente di 1 parametro
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
        {items.map((item, i) => (
          <WheelItemComponent 
            key={item.id}
            item={item}
            index={i}
            dragX={dragX}
            itemsLength={itemsLength}
            handlePressWithDouble={handlePressWithDouble}
            setActiveParameter={setActiveParameter}
            updateState={updateState}
          />
        ))}
      </View>
    </GestureDetector>
  );
};

interface WheelItemComponentProps {
  item: WheelItem;
  index: number;
  dragX: Animated.SharedValue<number>;
  itemsLength: number;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
  setActiveParameter: (param: ParameterType | 'none') => void;
  updateState: (newIndex: number) => void;
}

const WheelItemComponent = ({ 
  item, index, dragX, itemsLength, handlePressWithDouble, setActiveParameter, updateState 
}: WheelItemComponentProps) => {
  const totalWidth = itemsLength * ITEM_WIDTH;
  const halfWidth = totalWidth / 2;

  const animatedStyle = useAnimatedStyle(() => {
    const rawX = (index * ITEM_WIDTH + dragX.value) % totalWidth;
    let x = rawX < 0 ? rawX + totalWidth : rawX;
    
    // Mappa le coordinate da [0, totalWidth] a [-halfWidth, halfWidth] per centrarle
    if (x > halfWidth) x -= totalWidth;
    
    const scale = interpolate(x, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.8, 1.15, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(x, [-ITEM_WIDTH, 0, ITEM_WIDTH], [0.4, 1.0, 0.4], Extrapolation.CLAMP);

    return {
      transform: [{ translateX: x }, { scale }],
      opacity,
      zIndex: x > -ITEM_WIDTH / 2 && x < ITEM_WIDTH / 2 ? 10 : 1,
    };
  });

  const handleTap = () => {
    const currentCenterIdx = Math.round(-dragX.value / ITEM_WIDTH);
    const normalizedCurrent = ((currentCenterIdx % itemsLength) + itemsLength) % itemsLength;
    
    let diff = index - normalizedCurrent;
    if (diff > itemsLength / 2) diff -= itemsLength;
    if (diff < -itemsLength / 2) diff += itemsLength;
    
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
  };

  return (
    <Animated.View style={[styles.slot, animatedStyle]} pointerEvents="box-none">
      <Pressable onPress={handleTap} style={styles.pressable} pointerEvents="auto">
        <View pointerEvents="none" style={styles.componentWrapper}>
          {item.component}
        </View>
      </Pressable>
    </Animated.View>
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
