import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, ParameterControl } from '@entities/system';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { DEFAULT_TORCH_STRENGTH } from '@grovkornet/shared';

const formatTorchStrength = (v: number) => {
  'worklet';
  return `${(v * 100).toFixed(0)}`;
};

interface TorchSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const TorchSubPanel = ({ animatedStyle: _animatedStyle }: TorchSubPanelProps) => {
  const { t } = useTranslation();
  const bodyWorklets = useBodyWorklets();

  const { activeDetailPanel, setActiveDetailPanel } = useSystemStore(useShallow(state => ({
    activeDetailPanel: state.activeDetailPanel,
    setActiveDetailPanel: state.setActiveDetailPanel,
  })));

  const {
    torchStrength,
    setTorchStrength,
  } = useBodyStore(useShallow(state => ({
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
  })));

  return (
    <Animated.View style={[styles.childSubContainer, _animatedStyle]}>
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
        onReset={() => {
          setTorchStrength(DEFAULT_TORCH_STRENGTH);
          bodyWorklets.updateTorchStrength(DEFAULT_TORCH_STRENGTH);
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    width: '100%',
    gap: 40,
  },
});
