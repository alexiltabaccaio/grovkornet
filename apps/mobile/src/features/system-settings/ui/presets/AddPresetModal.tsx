import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset } from '@entities/preset';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const AddPresetModal = () => {
  const { t } = useTranslation();
  const { isAddModalVisible, setAddModalVisible, addPreset, userPresets } = usePresetStore(
    useShallow((s: any) => ({
      isAddModalVisible: s.isAddModalVisible,
      setAddModalVisible: s.setAddModalVisible,
      addPreset: s.addPreset,
      userPresets: s.userPresets,
    }))
  );

  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    // Reset state before rendering if modal is closed, but don't do it blindly
    if (!isAddModalVisible && newPresetName !== '') {
      setNewPresetName('');
    }
  }, [isAddModalVisible, newPresetName]);

  useEffect(() => {
    const onBackPress = () => {
      if (isAddModalVisible) {
        setAddModalVisible(false);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [isAddModalVisible, setAddModalVisible]);

  if (!isAddModalVisible) return null;

  const handleSavePreset = () => {
    const trimmedName = newPresetName.trim();
    if (!trimmedName) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('presets.error_title', 'Errore'), t('presets.error_empty', 'Il nome non può essere vuoto'));
      return;
    }

    const isDuplicate = userPresets.some(
      (p: Preset) => p.name.toLowerCase() === trimmedName.toLowerCase() || trimmedName.toLowerCase() === 'default'
    );
    if (isDuplicate) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('presets.error_title', 'Errore'), t('presets.error_duplicate', 'Questo nome è già in uso'));
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPreset(trimmedName);
    setAddModalVisible(false);
  };

  return (
    <Animated.View 
      style={styles.modalOverlay} 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(200)}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle} allowFontScaling={false}>
          {t('presets.save_title', 'SALVA PRESET')}
        </Text>
        
        <TextInput
          style={styles.textInput}
          placeholder={t('presets.placeholder', 'NOME PRESET')}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          value={newPresetName}
          onChangeText={setNewPresetName}
          autoFocus={true}
          maxLength={20}
          autoCapitalize="characters"
          selectTextOnFocus={true}
          allowFontScaling={false}
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={() => setAddModalVisible(false)}
            activeOpacity={0.7}
            style={[styles.modalButton, styles.modalCancelButton]}
          >
            <Text style={styles.modalButtonText} allowFontScaling={false}>
              {t('presets.cancel', 'ANNULLA')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSavePreset}
            activeOpacity={0.7}
            style={[styles.modalButton, styles.modalSaveButton]}
          >
            <Text style={[styles.modalButtonText, styles.modalSaveText]} allowFontScaling={false}>
              {t('presets.save', 'SALVA')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    color: '#FF9500',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  textInput: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    textAlign: 'center',
    marginBottom: 18,
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
  modalSaveButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderColor: '#FF9500',
  },
  modalButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8e8e93',
    letterSpacing: 0.8,
  },
  modalSaveText: {
    color: '#FF9500',
  },
});
