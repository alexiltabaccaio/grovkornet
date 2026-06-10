import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useSystemStore, ParameterPanelWrapper } from '@entities/system';
import { useBodyStore } from '@entities/body';
import { PillButton } from '@shared/ui';
import { useAnimatedReaction, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import * as Haptics from '@shared/lib/haptics';

interface TorchPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const TorchPanel = ({ animatedStyle }: TorchPanelProps) => {
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);

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
    <ParameterPanelWrapper animatedStyle={animatedStyle}>
      <PillButton
        label={buttonLabel}
        isActive={isTorchActive}
        onPress={handleToggle}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.toggleButton}
      />
    </ParameterPanelWrapper>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    width: 60,
  },
});
