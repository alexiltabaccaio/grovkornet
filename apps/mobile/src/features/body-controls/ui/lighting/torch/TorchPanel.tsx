import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { useBodyStore } from '@entities/body';
import { PillButton } from '@shared/ui';
import Animated, { useAnimatedReaction, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import * as Haptics from '@shared/lib/haptics';

interface TorchPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

export const TorchPanel = ({ parameterDetailPanelAnimatedStyle }: TorchPanelProps) => {
  const isDebugEnabled = useSystemStore(state => state.isDebugEnabled);

  const {
    torchState,
    setTorchState,
  } = useBodyStore(useShallow(state => ({
    torchState: state.torchState,
    setTorchState: state.setTorchState,
  })));

  const [localTorchState, setLocalTorchState] = React.useState(() => torchState.value);

  useAnimatedReaction(
    () => torchState.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalTorchState)(currentValue);
      }
    },
    [torchState]
  );

  const handleToggle = () => {
    void Haptics.selectionAsync();
    logger.debug('TorchPanel', 'Torch toggle pressed');
    const next = torchState.value === 0 ? 1 : 0;
    setTorchState(next);
    setLocalTorchState(next);
  };

  const isTorchActive = useDerivedValue(() => torchState.value === 1);
  const buttonLabel = localTorchState === 0 ? 'OFF' : 'ON';

  return (
    <Animated.View style={[styles.parameterDetailPanelContainer, parameterDetailPanelAnimatedStyle]}>
      <PillButton
        label={buttonLabel}
        isActive={isTorchActive}
        onPress={handleToggle}
        isDebugEnabled={isDebugEnabled}
        style={styles.toggleButton}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  parameterDetailPanelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 0,
  },
  toggleButton: {
    width: 60,
  },
});
