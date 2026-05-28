import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { GenericPillDetailPanel } from '@entities/system';
import Animated, { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@shared/lib/logger';

interface ResolutionDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['4K', '1080p', '720p', '480p', '360p', '240p', '144p'];

export const ResolutionDetailPanel = ({ parameterDetailPanelAnimatedStyle, animatedStyle }: ResolutionDetailPanelProps) => {
  const { t } = useTranslation();
  const {
    resolutionSetting,
    setResolutionSetting,
    previewIn4k,
    setPreviewIn4k,
  } = useBodyStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
    previewIn4k: state.previewIn4k,
    setPreviewIn4k: state.setPreviewIn4k,
  })));

  const [localResolutionSetting, setLocalResolutionSetting] = React.useState(() => resolutionSetting.value);
  const [localPreviewIn4k, setLocalPreviewIn4k] = React.useState(() => previewIn4k.value);

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
    () => previewIn4k.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalPreviewIn4k)(currentValue);
      }
    },
    [previewIn4k]
  );



  return (
    <View style={styles.container}>
      <GenericPillDetailPanel
        options={RESOLUTIONS}
        onChange={(_, index) => setResolutionSetting(index)}
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
      {localResolutionSetting === 0 && (
        <Animated.View style={[styles.previewIn4kContainer, animatedStyle]}>
          <View style={styles.toggleRowContainer}>
            <Text style={styles.toggleLabel} allowFontScaling={false}>
              {t('parameters.preview_in_4k').toUpperCase()}
            </Text>
            <TouchableOpacity
              onPress={() => {
                logger.debug('ResolutionDetailPanel', 'Preview in 4K toggle pressed');
                const next = previewIn4k.value === 0 ? 1 : 0;
                setPreviewIn4k(next);
                setLocalPreviewIn4k(next);
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('parameters.preview_in_4k')}
              style={[
                styles.pillButton,
                localPreviewIn4k === 1 ? styles.pillButtonActive : styles.pillButtonInactive
              ]}
            >
              <Text style={styles.pillValueText} allowFontScaling={false}>
                {localPreviewIn4k === 1 ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
            
          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={14} color="#FF453A" style={{ marginRight: 4 }} />
            <Text style={styles.warningText} allowFontScaling={false}>
              {t('parameters.preview_in_4k_warning')}
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
  previewIn4kContainer: {
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

