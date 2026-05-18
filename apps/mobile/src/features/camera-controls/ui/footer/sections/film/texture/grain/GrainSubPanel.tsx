import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface GrainSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
}

export const GrainSubPanel = ({ animatedStyle }: GrainSubPanelProps) => {
  const { t } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const { grainChroma, setGrainChroma, grainSize, setGrainSize } = useStylesStore(useShallow(state => ({
    grainChroma: state.grainChroma,
    setGrainChroma: state.setGrainChroma,
    grainSize: state.grainSize,
    setGrainSize: state.setGrainSize,
  })));

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
