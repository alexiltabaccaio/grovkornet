import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';
import { removePreset } from '../lib/presetActions';
import { PopupContainer } from '@shared/ui/popup/PopupContainer';

const DeletePresetModalComponent = () => {
  const { t } = useTranslation();
  const { isDeleteModalVisible, setDeleteModalVisible, userPresets, activePresetId } = usePresetStore(
    useShallow((s: PresetStore) => ({
      isDeleteModalVisible: s.isDeleteModalVisible,
      setDeleteModalVisible: s.setDeleteModalVisible,
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
    }))
  );

  const activePreset = userPresets.find((p: Preset) => p.id === activePresetId);
  const isCustomized = activePresetId === 'customized';
  const presetName = isCustomized ? t('presets.customized', 'Custom') : activePreset?.name;

  return (
    <PopupContainer 
      visible={isDeleteModalVisible} 
      title={t('presets.delete_title', 'ELIMINA PRESET')}
      onClose={() => setDeleteModalVisible(false)}
      accessibilityLabel={t('presets.cancel', 'ANNULLA')}
    >
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
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
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

export const DeletePresetModal = React.memo(DeletePresetModalComponent);
