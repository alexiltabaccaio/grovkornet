import React from 'react';
import { Text, StyleProp, TextStyle, StyleSheet } from 'react-native';
import Animated, { runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from '@shared/lib/haptics';

interface ResettableLabelProps {
  label: string;
  onReset?: () => void;
  style?: StyleProp<TextStyle>;
  allowFontScaling?: boolean;
}

export const ResettableLabel = React.memo(({
  label,
  onReset,
  style,
  allowFontScaling = false,
}: ResettableLabelProps) => {
  if (!onReset) {
    return (
      <Text allowFontScaling={allowFontScaling} style={style}>
        {label}
      </Text>
    );
  }

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDistance(20)
    .onEnd(() => {
      'worklet';
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(onReset)();
    });

  return (
    <GestureDetector gesture={doubleTap}>
      <Animated.View style={styles.container}>
        <Text allowFontScaling={allowFontScaling} style={style}>
          {label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
});

ResettableLabel.displayName = 'ResettableLabel';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
