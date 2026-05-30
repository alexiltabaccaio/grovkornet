import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, PresetStore } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';

import { nextQuickPreset, prevQuickPreset } from '../../lib/presetActions';

export const QuickPresetSelector = () => {
  const {
    activePresetId,
    getQuickSelectList,
    userPresets,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      activePresetId: s.activePresetId,
      getQuickSelectList: s.getQuickSelectList,
      userPresets: s.userPresets,
    }))
  );

  const quickSelectList = getQuickSelectList();
  const areArrowsEnabled = quickSelectList.length > 1;

  let activeName = 'Default';
  if (activePresetId === 'customized') {
    activeName = 'Personalizzato';
  } else if (activePresetId === 'default') {
    activeName = 'Default';
  } else {
    const quickPreset = quickSelectList.find((p) => p.id === activePresetId);
    if (quickPreset) {
      activeName = quickPreset.name;
    } else {
      const activePreset = userPresets.find((p) => p.id === activePresetId);
      activeName = activePreset ? activePreset.name : 'Default';
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
