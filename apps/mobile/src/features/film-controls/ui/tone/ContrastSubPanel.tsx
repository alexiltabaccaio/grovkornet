import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useFilmStore } from '@entities/film';
import { useFilmWorklets } from '@entities/film';
import { ParameterControl, useSystemStore } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { SubPanelContainer } from '@shared/ui';

interface ContrastSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ContrastSubPanel = React.memo(({ animatedStyle }: ContrastSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const { 
    pivot, setPivot, setPivotAuto 
  } = useFilmStore(
    useShallow(state => ({
      pivot: state.pivot,
      setPivot: state.setPivot,
      setPivotAuto: state.setPivotAuto,
    }))
  );

  const worklets = useFilmWorklets();

  return (
    <SubPanelContainer style={[styles.container, animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
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
    </SubPanelContainer>
  );
});

ContrastSubPanel.displayName = 'ContrastSubPanel';

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
