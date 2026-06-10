import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillPanel } from '@entities/system';

interface AspectRatioPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

export const AspectRatioPanel = React.memo(({ animatedStyle }: AspectRatioPanelProps) => {
  const { 
    aspectRatio, 
    setAspectRatio,
  } = useBodyStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
  })));

  return (
    <View style={styles.container}>
      <GenericPillPanel
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
        animatedStyle={animatedStyle}
        pillMaxWidth={65}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
});

