import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useSystemStore, useControlPanelStore, ParameterControl } from '@entities/system';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import { useTranslation } from 'react-i18next';
import { DEFAULT_TORCH_STRENGTH } from '@grovkornet/shared';
import { SubPanelContainer } from '@shared/ui';

const formatTorchStrength = (v: number) => {
  'worklet';
  return `${(v * 100).toFixed(0)}`;
};

interface TorchSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const TorchSubPanel = React.memo(({ animatedStyle: _animatedStyle }: TorchSubPanelProps) => {
  const { t } = useTranslation();
  const bodyWorklets = useBodyWorklets();

  const { activeDetailPanel, setActiveDetailPanel } = useControlPanelStore(useShallow(state => ({
    activeDetailPanel: state.activeDetailPanel,
    setActiveDetailPanel: state.setActiveDetailPanel,
  })));

  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);

  const {
    torchStrength,
    setTorchStrength,
  } = useBodyStore(useShallow(state => ({
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
  })));

  return (
    <SubPanelContainer style={[styles.childSubContainer, _animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
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
    </SubPanelContainer>
  );
});

const styles = StyleSheet.create({
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    width: '100%',
    gap: 40,
  },
});
