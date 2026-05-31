import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';

interface ContrastSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ContrastSubPanel = ({ animatedStyle }: ContrastSubPanelProps) => {
  const { t } = useTranslation();
  const { 
    pivot, setPivot, pivotAuto, setPivotAuto 
  } = useFilmStore(
    useShallow(state => ({
      pivot: state.pivot,
      setPivot: state.setPivot,
      pivotAuto: state.pivotAuto,
      setPivotAuto: state.setPivotAuto,
    }))
  );

  const worklets = useFilmWorklets();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.pivotContainer}>
        <ParameterControl
          label={t('parameters.pivot')}
          isActive={true}
          onPress={() => {}}
          value={pivot}
          minValue={0.0}
          maxValue={1.0}
          centerValue={0.5}
          onChange={setPivot}
          onUpdateWorklet={worklets.updatePivot}
          variant="slider"
          valueFormatter={(v: number) => {
            'worklet';
            const val = Math.round((v - 0.5) * 200);
            return val > 0 ? `+${val}` : `${val}`;
          }}
          onReset={() => setPivotAuto(true)}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  pivotContainer: {
    width: '100%',
  },
});
