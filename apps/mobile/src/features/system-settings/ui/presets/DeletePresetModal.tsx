import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { removePreset } from '../../lib/presetActions';

export const DeletePresetModal = () => {
  const { t } = useTranslation();
  const { isDeleteModalVisible, setDeleteModalVisible, userPresets, activePresetId } = usePresetStore(
    useShallow((s: PresetStore) => ({
      isDeleteModalVisible: s.isDeleteModalVisible,
      setDeleteModalVisible: s.setDeleteModalVisible,
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
    }))
  );

  if (!isDeleteModalVisible) return null;

  const activePreset = userPresets.find((p: Preset) => p.id === activePresetId);
  const isCustomized = activePresetId === 'customized';
  const presetName = isCustomized ? t('presets.customized', 'Custom') : activePreset?.name;

  return (
    <Animated.View 
      style={styles.modalOverlay} 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(200)}
    >
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={() => setDeleteModalVisible(false)} 
        accessibilityLabel={t('presets.cancel', 'ANNULLA')}
      />
      <Pressable style={styles.modalContent}>
        <Text style={styles.modalTitle} allowFontScaling={false}>
          {t('presets.delete_title', 'ELIMINA PRESET')}
        </Text>
        
        <Text style={styles.modalBody} allowFontScaling={false}>
          {t('presets.delete_body', `Sei sicuro di voler eliminare "${presetName}"?`, { name: presetName })}
        </Text>

        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={() => setDeleteModalVisible(false)}
            activeOpacity={0.7}
            style={[styles.modalButton, styles.modalCancelButton]}
          >
            <Text style={styles.modalButtonText} allowFontScaling={false}>
              {t('presets.cancel', 'ANNULLA')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setDeleteModalVisible(false);
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (activePreset || isCustomized) {
                removePreset(activePresetId);
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
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
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
