import React from 'react';
import { StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../model/useUIStore';
import { useHardwareStore } from '../model/useHardwareStore';
import { useStylesStore } from '../model/useStylesStore';
import { ParameterControl } from './ParameterControl';
import Animated, { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

interface SubParameterPanelProps {
  translateY: SharedValue<number>;
}

export const SubParameterPanel = ({ translateY }: SubParameterPanelProps) => {
  const { t } = useTranslation();

  const { activeParameter, activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeParameter: state.activeParameter,
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const {
    grainChroma,
    setGrainChroma,
    grainSize,
    setGrainSize,
    aberrationDirection,
    setAberrationDirection,
  } = useStylesStore(useShallow(state => ({
    grainChroma: state.grainChroma,
    setGrainChroma: state.setGrainChroma,
    grainSize: state.grainSize,
    setGrainSize: state.setGrainSize,
    aberrationDirection: state.aberrationDirection,
    setAberrationDirection: state.setAberrationDirection,
  })));

  const {
    torchStrength,
    setTorchStrength,
  } = useHardwareStore(useShallow(state => ({
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
  })));

  const animatedStyle = useAnimatedStyle(() => {
    if (!translateY) return { opacity: 0 };

    const opacity = interpolate(
      translateY.value,
      [-90, -25, 0],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  if (!translateY || activeParameter === 'none') return null;

  const renderSubParams = () => {
    switch (activeParameter) {
      case 'grain':
        return (
          <Animated.View style={[styles.container, animatedStyle]}>
            <ParameterControl
              label={t('parameters.chroma')}
              isActive={activeSubParameter === 'grain_chroma'}
              onPress={() => {
                setActiveSubParameter('grain_chroma');
                setGrainChroma(grainChroma.value === 0 ? 1 : 0);
              }}
              value={grainChroma}
              renderValue={true}
              variant="text"
              valueFormatter={(v) => {
                'worklet';
                return v === 0 ? 'MONO' : 'RGB';
              }}
            />
            <ParameterControl
              label={t('parameters.size')}
              isActive={activeSubParameter === 'grain_size'}
              onPress={() => setActiveSubParameter('grain_size')}
              value={grainSize}
              minValue={1.0}
              maxValue={4.0}
              onChange={setGrainSize}
              renderValue={true}
              valueFormatter={(v) => {
                'worklet';
                return `${v.toFixed(1)}x`;
              }}
              variant="text"
            />
          </Animated.View>
        );
      case 'torch':
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
      case 'chromatic_aberration':
        return (
          <Animated.View style={[styles.container, animatedStyle]}>
            <ParameterControl
              label={t('parameters.direction')}
              isActive={activeSubParameter === 'aberration_direction'}
              onPress={() => {
                setActiveSubParameter('aberration_direction');
                const nextDir = (aberrationDirection.value + 1) % 3;
                setAberrationDirection(nextDir);
              }}
              value={aberrationDirection}
              renderValue={true}
              variant="text"
              valueFormatter={(v) => {
                'worklet';
                switch (v) {
                  case 0: return 'STD'; // Standard (Vertical visual on portrait)
                  case 1: return 'HOR'; // Horizontal
                  case 2: return 'RAD'; // Radial
                  default: return 'STD';
                }
              }}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return renderSubParams();
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
