import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface AberrationSubPanelProps {
  animatedStyle: StyleProp<ViewStyle>;
}

export const AberrationSubPanel = ({ animatedStyle }: AberrationSubPanelProps) => {
  const { t } = useTranslation();

  const { activeSubParameter, setActiveSubParameter } = useUIStore(useShallow(state => ({
    activeSubParameter: state.activeSubParameter,
    setActiveSubParameter: state.setActiveSubParameter,
  })));

  const { aberrationDirection, setAberrationDirection } = useStylesStore(useShallow(state => ({
    aberrationDirection: state.aberrationDirection,
    setAberrationDirection: state.setAberrationDirection,
  })));

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
