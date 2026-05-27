import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Text, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import { ParameterDetailPanelWrapper } from '@entities/system';
import * as Haptics from 'expo-haptics';

interface PresetsDetailPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const PresetsDetailPanel = ({ animatedStyle }: PresetsDetailPanelProps) => {
  const { t } = useTranslation();
  const {
    userPresets,
    activePresetId,
    removePreset,
    setFavoritePreset,
    toggleQuickSelect,
    setAddModalVisible,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
      removePreset: s.removePreset,
      setFavoritePreset: s.setFavoritePreset,
      toggleQuickSelect: s.toggleQuickSelect,
      setAddModalVisible: s.setAddModalVisible,
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
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleQuickSelect(activePreset.id);
    } catch (error) {
      const err = error as Error;
      if (err.message === 'LIMIT_EXCEEDED') {
        Alert.alert(
          t('presets.limit_title', 'Limite Raggiunto'),
          t('presets.limit_body', 'Puoi selezionare al massimo 5 preset per la scelta rapida')
        );
      }
    }
  };

  const handleDeletePress = () => {
    if (!activePreset) return;
    Alert.alert(
      t('presets.delete_title', 'Elimina Preset'),
      t('presets.delete_body', `Sei sicuro di voler eliminare "${activePreset.name}"?`, { name: activePreset.name }),
      [
        { text: t('presets.cancel', 'Annulla'), style: 'cancel' },
        {
          text: t('presets.delete', 'Elimina'),
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removePreset(activePreset.id);
          },
        },
      ]
    );
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
              <Ionicons name={inQuickSelect ? "flash" : "flash-outline"} size={16} color={inQuickSelect ? "#FF9500" : "#FFF"} />
              <Text style={[styles.actionText, inQuickSelect && { color: "#FF9500" }]}>{t('presets.quick_select', 'Rapida')}</Text>
            </TouchableOpacity>
          )}

          {activePreset && (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeletePress}>
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>{t('presets.delete', 'Elimina')}</Text>
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
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
