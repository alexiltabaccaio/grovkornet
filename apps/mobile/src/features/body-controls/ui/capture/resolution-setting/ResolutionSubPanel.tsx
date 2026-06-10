import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/shallow';
import { useBodyStore } from '@entities/body';
import { useSystemStore } from '@entities/system';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@shared/lib/logger';
import { SubPanelContainer } from '@shared/ui';
import { usePreferencesStore } from '@entities/preferences';

interface ResolutionSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ResolutionSubPanel = ({ animatedStyle }: ResolutionSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const {
    resolutionSetting,
    previewQuality,
    setPreviewQuality,
  } = useBodyStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    previewQuality: state.previewQuality,
    setPreviewQuality: state.setPreviewQuality,
  })));

  const [localResolutionSetting, setLocalResolutionSetting] = React.useState(() => resolutionSetting.value);
  const [localPreviewQuality, setLocalPreviewQuality] = React.useState(() => previewQuality.value);

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
    () => previewQuality.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalPreviewQuality)(currentValue);
      }
    },
    [previewQuality]
  );

  return (
    <SubPanelContainer style={[styles.previewQualityContainer, animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <View style={styles.rowContainer}>
        <Text style={styles.label} allowFontScaling={false}>
          {t('parameters.preview_quality').toUpperCase()}
        </Text>
        <View style={styles.buttonGroup}>
          {[
            { value: 0, label: t('parameters.preview_quality_max') },
            { value: 1, label: t('parameters.preview_quality_opt') },
            { value: 2, label: t('parameters.preview_quality_save') },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                logger.debug('ResolutionSubPanel', `Preview quality changed to: ${option.value}`);
                setPreviewQuality(option.value);
                setLocalPreviewQuality(option.value);
                usePreferencesStore.getState().setPreviewQualityPref(option.value);
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={[
                styles.pillButton,
                localPreviewQuality === option.value ? styles.pillButtonActive : styles.pillButtonInactive
              ]}
            >
              <Text style={styles.pillValueText} allowFontScaling={false}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
        
      {localPreviewQuality === 0 && localResolutionSetting === 0 && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={14} color="#FF453A" style={{ marginRight: 4 }} />
          <Text style={styles.warningText} allowFontScaling={false}>
            {t('parameters.preview_quality_warning')}
          </Text>
        </View>
      )}
    </SubPanelContainer>
  );
};

const styles = StyleSheet.create({
  previewQualityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    width: '100%',
    gap: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  label: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    width: '100%',
  },
  warningText: {
    color: '#FF453A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
});
