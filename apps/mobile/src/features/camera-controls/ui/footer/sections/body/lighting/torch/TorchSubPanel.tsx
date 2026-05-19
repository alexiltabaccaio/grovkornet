import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface TorchSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const TorchSubPanel = ({ animatedStyle, parameterExtensionAnimatedStyle }: TorchSubPanelProps) => {
  const { t } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const { torchState, setTorchState, torchStrength, setTorchStrength } = useHardwareStore(useShallow(state => ({
    torchState: state.torchState,
    setTorchState: state.setTorchState,
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Interruttore Torcia (sempre visibile a -35px) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={false}
          onPress={() => {
            setTorchState(torchState.value === 0 ? 1 : 0);
          }}
          value={torchState}
          variant="text"
          renderValue={true}
          isToggle={true}
          valueFormatter={(v) => {
            'worklet';
            return v === 0 ? 'OFF' : 'ON';
          }}
        />
      </Animated.View>
      
      {/* Sub-parametro figlio: Dimmer (visibile solo aprendo la bottom sheet a -90px) */}
      <Animated.View style={[styles.childSubContainer, animatedStyle]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    // Sposta il pulsante ulteriormente verso l'alto per avvicinarlo a TORCIA
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
});
