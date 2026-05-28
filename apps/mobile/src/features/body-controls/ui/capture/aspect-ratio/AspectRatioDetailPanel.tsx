import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillDetailPanel } from '@entities/system';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@shared/lib/logger';

interface AspectRatioDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

export const AspectRatioDetailPanel = ({ parameterDetailPanelAnimatedStyle, animatedStyle }: AspectRatioDetailPanelProps) => {
  const { t } = useTranslation();
  const { 
    aspectRatio, 
    setAspectRatio,
    resolutionSetting,
    force4k60fpsCrop,
    setForce4k60fpsCrop
  } = useBodyStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
    resolutionSetting: state.resolutionSetting,
    force4k60fpsCrop: state.force4k60fpsCrop,
    setForce4k60fpsCrop: state.setForce4k60fpsCrop,
  })));

  const [localResolutionSetting, setLocalResolutionSetting] = React.useState(() => resolutionSetting.value);
  const [localForce4k60fpsCrop, setLocalForce4k60fpsCrop] = React.useState(() => force4k60fpsCrop.value);
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
    () => force4k60fpsCrop.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalForce4k60fpsCrop)(currentValue);
      }
    },
    [force4k60fpsCrop]
  );

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
      {localResolutionSetting === 0 && localAspectRatio !== 1 && localAspectRatio !== 4 && (
        <Animated.View style={[styles.cropContainer, animatedStyle]}>
          <View style={styles.toggleRowContainer}>
            <Text style={styles.toggleLabel} allowFontScaling={false}>
              {t('parameters.apply_crop')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                logger.debug('AspectRatioDetailPanel', 'Apply Crop toggle pressed');
                const next = force4k60fpsCrop.value === 0 ? 1 : 0;
                setForce4k60fpsCrop(next);
                setLocalForce4k60fpsCrop(next);
                usePreferencesStore.getState().setForce4k60fpsCropPref(next);
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Applica Crop"
              style={[
                styles.pillButton,
                localForce4k60fpsCrop === 1 ? styles.pillButtonActive : styles.pillButtonInactive
              ]}
            >
              <Text style={styles.pillValueText} allowFontScaling={false}>
                {localForce4k60fpsCrop === 1 ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={14} color="#FF453A" style={{ marginRight: 4 }} />
            <Text style={styles.warningText} allowFontScaling={false}>
              {localForce4k60fpsCrop === 1 
                ? t('parameters.crop_active_warning')
                : t('parameters.crop_inactive_warning')}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  cropContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
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
