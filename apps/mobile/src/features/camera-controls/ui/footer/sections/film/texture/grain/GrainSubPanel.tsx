import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface GrainSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const GrainSubPanel = ({ animatedStyle, parameterExtensionAnimatedStyle }: GrainSubPanelProps) => {
  const { t } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const { grainIntensity, setGrainIntensity, grainChroma, setGrainChroma, grainSize, setGrainSize } = useStylesStore(useShallow(state => ({
    grainIntensity: state.grainIntensity,
    setGrainIntensity: state.setGrainIntensity,
    grainChroma: state.grainChroma,
    setGrainChroma: state.setGrainChroma,
    grainSize: state.grainSize,
    setGrainSize: state.setGrainSize,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Slider Intensità Grana (sempre visibile a -35px) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={activeSubParameter === 'grain_intensity'} // optional gesture activation flag
          onPress={() => setActiveSubParameter('grain_intensity')}
          value={grainIntensity}
          minValue={0}
          maxValue={1.0}
          onChange={setGrainIntensity}
          variant="slider"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          }}
          onReset={() => setGrainIntensity(0)}
        />
      </Animated.View>

      {/* Sub-parametri figli: Chroma e Size (visibili a -90px) */}
      <Animated.View style={[styles.childSubContainer, animatedStyle]}>
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
    marginTop: -35, // Avvicina lo slider al pulsante superiore GRAIN
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
    gap: 40,
  },
});
