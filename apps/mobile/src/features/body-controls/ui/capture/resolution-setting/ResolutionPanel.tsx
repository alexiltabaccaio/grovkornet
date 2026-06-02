import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillPanel } from '@entities/system';

interface ResolutionPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['4K', '1080p', '720p', '480p', '360p', '240p', '144p'];

export const ResolutionPanel = ({ animatedStyle }: ResolutionPanelProps) => {
  const {
    resolutionSetting,
    setResolutionSetting,
  } = useBodyStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
  })));

  return (
    <View style={styles.container}>
      <GenericPillPanel
        options={RESOLUTIONS}
        onChange={(_, index) => {
          setResolutionSetting(index);
          usePreferencesStore.getState().setResolutionSettingPref(index);
        }}
        value={resolutionSetting}
        isActiveShared={(currVal, _, index) => {
          'worklet';
          return currVal === index;
        }}
        getLabel={(label) => label}
        animatedStyle={animatedStyle}
        pillMaxWidth={80}
        scrollable={true}
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


