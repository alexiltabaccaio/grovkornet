import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { ParameterControl, ParameterDetailPanelWrapper } from '@entities/system';
import { useBodyStore } from '@entities/body';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { logger } from '@shared/lib/logger';
import * as Haptics from '@shared/lib/haptics';

const noop = () => {};

const formatTorchState = (v: number) => {
  'worklet';
  return v === 0 ? 'OFF' : 'ON';
};

interface TorchPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

export const TorchPanel = ({ parameterDetailPanelAnimatedStyle }: TorchPanelProps) => {
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

  return (
    <View style={styles.container}>
      <ParameterDetailPanelWrapper animatedStyle={parameterDetailPanelAnimatedStyle}>
        <ScrollView scrollEnabled={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            onPress={() => {
              void Haptics.selectionAsync();
              logger.debug('TorchPanel', 'Torch toggle pressed');
              const next = torchState.value === 0 ? 1 : 0;
              setTorchState(next);
              setLocalTorchState(next);
            }}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={localTorchState === 0 ? "OFF" : "ON"}
            style={styles.toggleButton}
          >
            <View
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden={true}
              pointerEvents="none"
            >
              <ParameterControl
                label=""
                isActive={false}
                hideDebugRectangles={true}
                onPress={noop}
                value={torchState}
                variant="text"
                renderValue={true}
                isToggle={true}
                valueFormatter={formatTorchState}
                disableGestures={true}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </ParameterDetailPanelWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    alignSelf: 'center',
  },
});
