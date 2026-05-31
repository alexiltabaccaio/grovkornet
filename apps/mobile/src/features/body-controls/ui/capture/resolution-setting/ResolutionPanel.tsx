import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillDetailPanel } from '@entities/system';

interface ResolutionPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['4K', '1080p', '720p', '480p', '360p', '240p', '144p'];

export const ResolutionPanel = ({ parameterDetailPanelAnimatedStyle }: ResolutionPanelProps) => {
  const {
    resolutionSetting,
    setResolutionSetting,
  } = useBodyStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
  })));

  return (
    <View style={styles.container}>
      <GenericPillDetailPanel
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
        parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
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


