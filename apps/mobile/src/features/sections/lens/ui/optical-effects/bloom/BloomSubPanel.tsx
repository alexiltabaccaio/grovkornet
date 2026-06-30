import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { SubPanelContainer } from '@shared/ui';
import { DEFAULT_BLOOM_THRESHOLD } from '@grovkornet/shared';

const formatThresholdValue = (v: number) => {
  'worklet';
  return `${Math.round(v * 100)}%`;
};

const noop = () => {};

interface BloomSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const BloomSubPanel = React.memo(({ animatedStyle }: BloomSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);
  const { bloomThreshold, setBloomThreshold } = useFilmStore(
    useShallow((state) => ({
      bloomThreshold: state.bloomThreshold,
      setBloomThreshold: state.setBloomThreshold,
    }))
  );
  const worklets = useFilmWorklets();

  return (
    <SubPanelContainer style={[styles.container, animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <ParameterControl
        label={t('parameters.bloomThreshold')}
        isActive={true}
        onPress={noop}
        value={bloomThreshold}
        minValue={0.0}
        maxValue={1.0}
        onChange={setBloomThreshold}
        onUpdateWorklet={worklets.updateBloomThreshold}
        variant="slider"
        valueFormatter={formatThresholdValue}
        onReset={() => {
          setBloomThreshold(DEFAULT_BLOOM_THRESHOLD);
          worklets.updateBloomThreshold(DEFAULT_BLOOM_THRESHOLD);
        }}
      />
    </SubPanelContainer>
  );
});

BloomSubPanel.displayName = 'BloomSubPanel';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
