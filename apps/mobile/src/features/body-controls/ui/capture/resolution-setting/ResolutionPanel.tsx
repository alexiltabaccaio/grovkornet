import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillPanel } from '@entities/system';

interface ResolutionPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['4K', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];

const RESOLUTION_WIDTHS: Record<string, number> = {
  '4K': 3840,
  '1440p': 2560,
  '1080p': 1920,
  '720p': 1280,
  '480p': 720,
  '360p': 640,
  '240p': 426,
  '144p': 256,
};

export const ResolutionPanel = ({ animatedStyle }: ResolutionPanelProps) => {
  const {
    resolutionSetting,
    setResolutionSetting,
    maxSupportedWidth,
  } = useBodyStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
    maxSupportedWidth: state.capabilities?.maxResolutionWidth ?? 3840,
  })));

  const availableResolutions = React.useMemo(() => {
    return RESOLUTIONS.filter(res => (RESOLUTION_WIDTHS[res] ?? 0) <= maxSupportedWidth);
  }, [maxSupportedWidth]);

  const activeLocalIndex = useDerivedValue(() => {
    const activeResName = RESOLUTIONS[resolutionSetting.value];
    const index = availableResolutions.indexOf(activeResName);
    return index !== -1 ? index : 0;
  }, [availableResolutions]);

  return (
    <View style={styles.container}>
      <GenericPillPanel
        options={availableResolutions}
        onChange={(_, localIndex) => {
          const globalIndex = RESOLUTIONS.indexOf(availableResolutions[localIndex]);
          if (globalIndex !== -1) {
            setResolutionSetting(globalIndex);
            usePreferencesStore.getState().setResolutionSettingPref(globalIndex);
          }
        }}
        value={activeLocalIndex}
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


