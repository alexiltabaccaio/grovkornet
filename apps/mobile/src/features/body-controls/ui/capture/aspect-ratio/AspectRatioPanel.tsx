import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillDetailPanel } from '@entities/system';

interface AspectRatioPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

export const AspectRatioPanel = ({ parameterDetailPanelAnimatedStyle }: AspectRatioPanelProps) => {
  const { 
    aspectRatio, 
    setAspectRatio,
  } = useBodyStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
  })));

  return (
    <View style={styles.container}>
      <GenericPillDetailPanel
        options={ASPECT_RATIOS}
        onChange={(_, index) => {
          setAspectRatio(index);
          usePreferencesStore.getState().setAspectRatioPref(index);
        }}
        value={aspectRatio}
        isActiveShared={(currVal, _, index) => {
          'worklet';
          return currVal === index;
        }}
        getLabel={(label) => label}
        parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
        pillMaxWidth={65}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
});

