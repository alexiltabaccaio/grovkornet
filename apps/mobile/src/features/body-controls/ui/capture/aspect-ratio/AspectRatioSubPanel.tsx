import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { useSystemStore } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@shared/lib/logger';
import { SubPanelContainer } from '@shared/ui';

interface AspectRatioSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const AspectRatioSubPanel = ({ animatedStyle }: AspectRatioSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const { 
    aspectRatio, 
    resolutionSetting,
    force60fpsCrop,
    setForce60fpsCrop
  } = useBodyStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    resolutionSetting: state.resolutionSetting,
    force60fpsCrop: state.force60fpsCrop,
    setForce60fpsCrop: state.setForce60fpsCrop,
  })));

  const [localResolutionSetting, setLocalResolutionSetting] = React.useState(() => resolutionSetting.value);
  const [localForce60fpsCrop, setLocalForce60fpsCrop] = React.useState(() => force60fpsCrop.value);
  const [localAspectRatio, setLocalAspectRatio] = React.useState(() => aspectRatio.value);

  useAnimatedReaction(
    () => aspectRatio.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalAspectRatio)(currentValue);
      }
    },
    [aspectRatio]
  );

  useAnimatedReaction(
    () => resolutionSetting.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalResolutionSetting)(currentValue);
      }
    },
    [resolutionSetting]
  );

  useAnimatedReaction(
    () => force60fpsCrop.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalForce60fpsCrop)(currentValue);
      }
    },
    [force60fpsCrop]
  );

  const isHighResolution = localResolutionSetting <= 1;

  if (!isHighResolution) {
    return null;
  }

  return (
    <SubPanelContainer style={[styles.cropContainer, animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <View style={styles.toggleRowContainer}>
        <Text style={styles.toggleLabel} allowFontScaling={false}>
          {t('parameters.apply_crop')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            logger.debug('AspectRatioSubPanel', 'Apply Crop toggle pressed');
            const next = force60fpsCrop.value === 0 ? 1 : 0;
            setForce60fpsCrop(next);
            setLocalForce60fpsCrop(next);
            usePreferencesStore.getState().setForce60fpsCropPref(next);
          }}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Applica Crop"
          style={[
            styles.pillButton,
            localForce60fpsCrop === 1 ? styles.pillButtonActive : styles.pillButtonInactive
          ]}
        >
          <Text style={styles.pillValueText} allowFontScaling={false}>
            {localForce60fpsCrop === 1 ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningContainer}>
        <Ionicons name="warning-outline" size={14} color="#FF453A" style={{ marginRight: 4 }} />
        <Text style={styles.warningText} allowFontScaling={false}>
          {localForce60fpsCrop === 1 
            ? t('parameters.crop_active_warning')
            : t('parameters.crop_inactive_warning')}
        </Text>
      </View>
    </SubPanelContainer>
  );
};

const styles = StyleSheet.create({
  cropContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    width: '100%',
    gap: 8,
  },
  toggleRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleLabel: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillButton: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    minWidth: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: '#FFF',
  },
  pillButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: '#333',
  },
  pillValueText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    letterSpacing: 0.5,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  warningText: {
    color: '#FF453A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
