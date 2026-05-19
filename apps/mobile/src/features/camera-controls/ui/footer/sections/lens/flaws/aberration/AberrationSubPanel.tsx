import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface AberrationSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const AberrationSubPanel = ({ animatedStyle, parameterExtensionAnimatedStyle }: AberrationSubPanelProps) => {
  const { t } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const { chromaticAberration, setChromaticAberration, aberrationDirection, setAberrationDirection } = useStylesStore(useShallow(state => ({
    chromaticAberration: state.chromaticAberration,
    setChromaticAberration: state.setChromaticAberration,
    aberrationDirection: state.aberrationDirection,
    setAberrationDirection: state.setAberrationDirection,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Slider Intensità (sempre visibile a -35px) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={chromaticAberration}
          minValue={0.0}
          maxValue={2.0}
          onChange={setChromaticAberration}
          variant="slider"
          valueFormatter={(v) => {
            'worklet';
            return `${Math.round(v * 100)}`;
          }}
          onReset={() => setChromaticAberration(0.0)}
        />
      </Animated.View>

      {/* Sub-parametro figlio: Direzione Aberrazione (visibile solo aprendo la bottom sheet a -90px) */}
      <Animated.View style={[styles.childSubContainer, animatedStyle]}>
        <ParameterControl
          label={t('parameters.direction')}
          isActive={activeSubParameter === 'aberration_direction'}
          onPress={() => {
            setActiveSubParameter(activeSubParameter === 'aberration_direction' ? 'none' : 'aberration_direction');
          }}
          value={aberrationDirection}
          onChange={(v) => {
            const nextDir = (Math.round(v) + 1) % 3;
            setAberrationDirection(nextDir);
          }}
          variant="text"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            switch (Math.round(v)) {
              case 0: return 'STD';
              case 1: return 'HOR';
              case 2: return 'RAD';
              default: return 'STD';
            }
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
    marginTop: -35,
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
