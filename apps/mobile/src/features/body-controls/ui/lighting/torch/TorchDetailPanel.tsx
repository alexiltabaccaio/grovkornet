import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, ParameterControl, ParameterDetailPanelWrapper } from '@entities/system';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import Animated, { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { logger } from '@shared/lib/logger';

const noop = () => {};

const formatTorchState = (v: number) => {
  'worklet';
  return v === 0 ? 'OFF' : 'ON';
};

const formatTorchStrength = (v: number) => {
  'worklet';
  return `${(v * 100).toFixed(0)}`;
};

interface TorchDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

export const TorchDetailPanel = ({ parameterDetailPanelAnimatedStyle, animatedStyle }: TorchDetailPanelProps) => {
  const { t } = useTranslation();
  const bodyWorklets = useBodyWorklets();

  const { activeDetailPanel, setActiveDetailPanel } = useSystemStore(useShallow(state => ({
    activeDetailPanel: state.activeDetailPanel,
    setActiveDetailPanel: state.setActiveDetailPanel,
  })));

  const {
    torchState,
    setTorchState,
    torchStrength,
    setTorchStrength,
  } = useBodyStore(useShallow(state => ({
    torchState: state.torchState,
    setTorchState: state.setTorchState,
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
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
              logger.debug('TorchDetailPanel', 'Torch toggle pressed');
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
      <Animated.View style={[styles.childSubContainer, animatedStyle]}>
        <ParameterControl
          label={t('parameters.torch_dimmer')}
          isActive={activeDetailPanel === 'torch_strength'}
          onPress={() => setActiveDetailPanel('torch_strength')}
          value={torchStrength}
          minValue={0.1}
          maxValue={1}
          onChange={setTorchStrength}
          onUpdateWorklet={bodyWorklets.updateTorchStrength}
          variant="slider"
          renderValue={true}
          valueFormatter={formatTorchStrength}
        />
      </Animated.View>
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
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    width: '100%',
    gap: 40,
  },
});
