import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { SubPanelContainer } from '@shared/ui';
import { DEFAULT_HALATION_THRESHOLD } from '@grovkornet/shared';

const formatThresholdValue = (v: number) => {
  'worklet';
  return `${Math.round(v * 100)}%`;
};

const noop = () => {};

interface HalationSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const HalationSubPanel = React.memo(({ animatedStyle }: HalationSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);
  const { halationThreshold, setHalationThreshold } = useFilmStore(
    useShallow((state) => ({
      halationThreshold: state.halationThreshold,
      setHalationThreshold: state.setHalationThreshold,
    }))
  );
  const worklets = useFilmWorklets();

  return (
    <SubPanelContainer style={[styles.container, animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <ParameterControl
        label={t('parameters.halationThreshold')}
        isActive={true}
        onPress={noop}
        value={halationThreshold}
        minValue={0.0}
        maxValue={1.0}
        onChange={setHalationThreshold}
        onUpdateWorklet={worklets.updateHalationThreshold}
        variant="slider"
        valueFormatter={formatThresholdValue}
        onReset={() => {
          setHalationThreshold(DEFAULT_HALATION_THRESHOLD);
          worklets.updateHalationThreshold(DEFAULT_HALATION_THRESHOLD);
        }}
      />
    </SubPanelContainer>
  );
});

HalationSubPanel.displayName = 'HalationSubPanel';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
