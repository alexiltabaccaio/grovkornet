import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import { ParameterDetailPanelWrapper } from '@entities/system';
import * as Haptics from '@shared/lib/haptics';

interface PresetsPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}


export const PresetsPanel = ({ animatedStyle }: PresetsPanelProps) => {
  const { t } = useTranslation();

  const {
    userPresets,
    activePresetId,
    setFavoritePreset,
    toggleQuickSelect,
    setAddModalVisible,
    setDeleteModalVisible,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
      setFavoritePreset: s.setFavoritePreset,
      toggleQuickSelect: s.toggleQuickSelect,
      setAddModalVisible: s.setAddModalVisible,
      setDeleteModalVisible: s.setDeleteModalVisible,
    }))
  );

  const activePreset = userPresets.find((p: Preset) => p.id === activePresetId);
  const favoritePreset = userPresets.find((p: Preset) => p.isFavorite);
  const isDefaultActive = activePresetId === 'default';
  const isCustomizedActive = activePresetId === 'customized';

  const isFavorite = isDefaultActive ? !favoritePreset : (activePreset?.isFavorite ?? false);
  const inQuickSelect = isDefaultActive || isCustomizedActive ? true : (activePreset?.inQuickSelect ?? false);

  const handleToggleFavorite = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isDefaultActive) {
      setFavoritePreset(null);
    } else if (activePreset) {
      setFavoritePreset(activePreset.id);
    }
  };

  const handleToggleQuickSelect = () => {
    if (!activePreset) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleQuickSelect(activePreset.id);
  };

  const handleDeletePress = () => {
    if (!activePreset && !isCustomizedActive) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteModalVisible(true);
  };

  const handleSavePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAddModalVisible(true);
  };

  return (
    <View style={styles.wrapper}>
      <ParameterDetailPanelWrapper
        animatedStyle={animatedStyle}
        scrollable={true}
        gap={16}
        paddingHorizontal={24}
      >
        <View style={styles.actionsContainer}>
          {isCustomizedActive && (
            <TouchableOpacity style={styles.actionButton} onPress={handleSavePress}>
              <Ionicons name="save-outline" size={16} color="#FFF" />
              <Text style={styles.actionText}>{t('presets.save', 'Salva')}</Text>
            </TouchableOpacity>
          )}

          {(!isCustomizedActive) && (
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
              <Ionicons name={isFavorite ? "star" : "star-outline"} size={16} color="#FFF" />
              <Text style={styles.actionText}>{t('presets.default', 'Predefinito')}</Text>
            </TouchableOpacity>
          )}

          {activePreset && (
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleQuickSelect}>
              <Ionicons name={inQuickSelect ? "flash" : "flash-outline"} size={16} color={inQuickSelect ? "#FF5722" : "#FFF"} />
              <Text style={[styles.actionText, inQuickSelect && { color: "#FF5722" }]}>{t('presets.quick_select', 'Rapida')}</Text>
            </TouchableOpacity>
          )}

          {(activePreset || isCustomizedActive) && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDeletePress}
              accessibilityLabel="Delete preset"
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </ParameterDetailPanelWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  deleteButton: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    paddingHorizontal: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
