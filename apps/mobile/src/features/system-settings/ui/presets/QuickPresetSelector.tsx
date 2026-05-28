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
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      activePresetId: s.activePresetId,
      getQuickSelectList: s.getQuickSelectList,
    }))
  );

  const quickSelectList = getQuickSelectList();
  const showArrows = quickSelectList.length > 1;

  const activePreset = quickSelectList.find((p: { id: string; name: string }) => p.id === activePresetId);
  const activeName = activePreset?.name || 'Default';

  const handleNext = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextQuickPreset();
  };

  const handlePrev = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    prevQuickPreset();
  };

  const getPresetColor = () => {
    if (activePresetId === 'customized') return '#FF2D55'; // Pink/Red for customized
    if (activePresetId === 'default') return '#FFF'; // White for default
    return '#FF9500'; // Orange for user presets
  };

  return (
    <View style={styles.container}>
      {showArrows && (
        <TouchableOpacity
          onPress={handlePrev}
          activeOpacity={0.6}
          style={styles.arrowButton}
          accessibilityLabel="Previous preset"
        >
          <Ionicons name="chevron-back" size={12} color="rgba(255, 255, 255, 0.4)" />
        </TouchableOpacity>
      )}

      <View style={styles.textContainer}>
        <Text
          style={[styles.presetText, { color: getPresetColor() }]}
          allowFontScaling={false}
          numberOfLines={1}
        >
          {activeName}
        </Text>
      </View>

      {showArrows && (
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.6}
          style={styles.arrowButton}
          accessibilityLabel="Next preset"
        >
          <Ionicons name="chevron-forward" size={12} color="rgba(255, 255, 255, 0.4)" />
        </TouchableOpacity>
      )}
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
    minWidth: 80,
    maxWidth: 150,
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
});
