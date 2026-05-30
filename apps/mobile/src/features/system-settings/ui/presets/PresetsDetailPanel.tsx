import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, StyleProp, ViewStyle, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import { ParameterDetailPanelWrapper } from '@entities/system';
import * as Haptics from '@shared/lib/haptics';

interface PresetsDetailPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

import { removePreset } from '../../lib/presetActions';

export const PresetsDetailPanel = ({ animatedStyle }: PresetsDetailPanelProps) => {
  const { t } = useTranslation();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    userPresets,
    activePresetId,
    setFavoritePreset,
    toggleQuickSelect,
    setAddModalVisible,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleQuickSelect(activePreset.id);
  };

  const handleDeletePress = () => {
    if (!activePreset) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDeleteModalVisible(true);
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

          {activePreset && (
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

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} allowFontScaling={false}>
              {t('presets.delete_title', 'ELIMINA PRESET')}
            </Text>
            
            <Text style={styles.modalBody} allowFontScaling={false}>
              {t('presets.delete_body', `Sei sicuro di voler eliminare "${activePreset?.name}"?`, { name: activePreset?.name })}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsDeleteModalVisible(false)}
                activeOpacity={0.7}
                style={[styles.modalButton, styles.modalCancelButton]}
              >
                <Text style={styles.modalButtonText} allowFontScaling={false}>
                  {t('presets.cancel', 'ANNULLA')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  if (activePreset) {
                    removePreset(activePreset.id);
                  }
                }}
                activeOpacity={0.7}
                style={[styles.modalButton, styles.modalDeleteButton]}
                accessibilityLabel="Confirm delete"
              >
                <Text style={[styles.modalButtonText, styles.modalDeleteText]} allowFontScaling={false}>
                  {t('presets.delete', 'ELIMINA')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 290,
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF5722',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  modalBody: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalDeleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderColor: '#FF3B30',
  },
  modalButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8e8e93',
    letterSpacing: 0.8,
  },
  modalDeleteText: {
    color: '#FF3B30',
  },
});
