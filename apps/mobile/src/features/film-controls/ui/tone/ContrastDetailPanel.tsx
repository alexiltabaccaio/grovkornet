import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';

export const ContrastDetailPanel = () => {
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
    <View style={styles.container}>
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
    </View>
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
