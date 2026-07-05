import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/shallow';
import { usePresetStore, PresetStore } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';
import { useTranslation } from 'react-i18next';

import { nextQuickPreset, prevQuickPreset, generateQuickSelectList } from '../lib/presetActions';

const QuickPresetSelectorComponent = () => {
  const {
    activePresetId,
    userPresets,
    customizedPayload,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      activePresetId: s.activePresetId,
      userPresets: s.userPresets,
      customizedPayload: s.customizedPayload,
    }))
  );

  const { t } = useTranslation();
  const quickSelectList = useMemo(() => {
    return generateQuickSelectList({ activePresetId, userPresets, customizedPayload });
  }, [activePresetId, userPresets, customizedPayload]);
  const areArrowsEnabled = quickSelectList.length > 1;

  let activeName = t('presets.default', 'Default');
  if (activePresetId === 'customized') {
    activeName = t('presets.customized', 'Custom');
  } else if (activePresetId === 'default') {
    activeName = t('presets.default', 'Default');
  } else {
    const quickPreset = quickSelectList.find((p) => p.id === activePresetId);
    if (quickPreset) {
      activeName = quickPreset.name;
    } else {
      const activePreset = userPresets.find((p) => p.id === activePresetId);
      activeName = activePreset ? activePreset.name : t('presets.default', 'Default');
    }
  }

  const handleNext = () => {
    if (!areArrowsEnabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextQuickPreset();
  };

  const handlePrev = () => {
    if (!areArrowsEnabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    prevQuickPreset();
  };

  const getPresetColor = () => {
    return '#FFF';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePrev}
        activeOpacity={0.6}
        disabled={!areArrowsEnabled}
        style={[styles.arrowButton, !areArrowsEnabled && styles.disabledArrow]}
        accessibilityLabel="Previous preset"
        hitSlop={{ left: 30, right: 70 }}
      >
        <Ionicons name="chevron-back" size={12} color="rgba(255, 255, 255, 0.4)" />
      </TouchableOpacity>

      <View style={styles.textContainer} pointerEvents="none">
        <Text
          style={[styles.presetText, { color: getPresetColor() }]}
          allowFontScaling={false}
          numberOfLines={1}
        >
          {activeName}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.6}
        disabled={!areArrowsEnabled}
        style={[styles.arrowButton, !areArrowsEnabled && styles.disabledArrow]}
        accessibilityLabel="Next preset"
        hitSlop={{ left: 70, right: 30 }}
      >
        <Ionicons name="chevron-forward" size={12} color="rgba(255, 255, 255, 0.4)" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  textContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
  },
  presetText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  arrowButton: {
    paddingHorizontal: 6,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledArrow: {
    opacity: 0.2,
  },
});

export const QuickPresetSelector = React.memo(QuickPresetSelectorComponent);
