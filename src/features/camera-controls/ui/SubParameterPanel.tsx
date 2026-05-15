import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../model/useUIStore';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { PrimaryParameterControl } from './PrimaryParameterControl';
import Animated, { SharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

interface SubParameterPanelProps {
  translateY: SharedValue<number>;
}

export const SubParameterPanel = ({ translateY }: SubParameterPanelProps) => {
  if (!translateY) return null;

  const { t } = useTranslation();
  
  const { activePrimaryParameter, activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activePrimaryParameter: state.activePrimaryParameter,
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const {
    grainChroma,
    setGrainChroma,
    grainSize,
    setGrainSize,
  } = useCameraEffectsStore(useShallow(state => ({
    grainChroma: state.grainChroma,
    setGrainChroma: state.setGrainChroma,
    grainSize: state.grainSize,
    setGrainSize: state.setGrainSize,
  })));

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-100, -50, 0],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });


  if (activePrimaryParameter === 'none') return null;

  const renderSubParams = () => {
    switch (activePrimaryParameter) {
      case 'grain':
        return (
          <Animated.View style={[styles.container, animatedStyle]}>
            <PrimaryParameterControl
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
            <PrimaryParameterControl
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
    paddingVertical: 20,
    width: '100%',
  },
});
