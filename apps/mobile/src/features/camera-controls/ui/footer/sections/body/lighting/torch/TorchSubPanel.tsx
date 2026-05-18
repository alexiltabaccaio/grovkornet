import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface TorchSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
}

export const TorchSubPanel = ({ animatedStyle }: TorchSubPanelProps) => {
  const { t } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const { torchStrength, setTorchStrength } = useHardwareStore(useShallow(state => ({
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
  })));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ParameterControl
        label={t('parameters.torch_dimmer')}
        isActive={activeSubParameter === 'torch_strength'}
        onPress={() => setActiveSubParameter('torch_strength')}
        value={torchStrength}
        minValue={0.1}
        maxValue={1}
        onChange={setTorchStrength}
        variant="text"
        renderValue={true}
        valueFormatter={(v) => {
          'worklet';
          return `${(v * 100).toFixed(0)}`;
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
});
