import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset, DEFAULT_FILM_PAYLOAD, FilmPresetPayload, PresetStore, PresetPayload } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Asset } from 'expo-asset';
import { generatePresetPreview, deleteFile, CameraErrorCode, CAMERA_ERROR_DETAILS } from '@grovkornet/engine';
import { useFilmStore } from '@entities/film';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const monoscopeAssetSource = require('../../../../../assets/monoscope.jpg') as number;

const getActiveFilmPayload = (customizedPayload: PresetPayload | null): FilmPresetPayload => {
  if (customizedPayload?.film) {
    return customizedPayload.film;
  }
  
  const filmStore = useFilmStore.getState();
  const filmPayload: Partial<FilmPresetPayload> = {};
  const target = filmPayload as Record<keyof FilmPresetPayload, unknown>;
  Object.keys(DEFAULT_FILM_PAYLOAD).forEach((key) => {
    const k = key as keyof FilmPresetPayload;
    const val = filmStore[k] as unknown;
    target[k] = val && typeof val === 'object' && 'value' in val
      ? (val as { value: number | boolean }).value
      : DEFAULT_FILM_PAYLOAD[k];
  });
  return filmPayload as FilmPresetPayload;
};

import { addPreset } from '../../lib/presetActions';

export const AddPresetModal = () => {
  const { t } = useTranslation();
  const { isAddModalVisible, setAddModalVisible, userPresets, customizedPayload } = usePresetStore(
    useShallow((s: PresetStore) => ({
      isAddModalVisible: s.isAddModalVisible,
      setAddModalVisible: s.setAddModalVisible,
      userPresets: s.userPresets,
      customizedPayload: s.customizedPayload,
    }))
  );

  const [newPresetName, setNewPresetName] = useState('');
  const [tempThumbnailUri, setTempThumbnailUri] = useState<string | null>(null);
  
  const isSavedRef = useRef(false);

  useEffect(() => {
    const onBackPress = () => {
      if (isAddModalVisible) {
        setNewPresetName('');
        setAddModalVisible(false);
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isAddModalVisible, setAddModalVisible]);

  useEffect(() => {
    let active = true;
    let localTempUri: string | null = null;

    const generatePreview = async () => {
      if (!isAddModalVisible) return;
      isSavedRef.current = false;
      setTempThumbnailUri(null);
      try {
        const asset = Asset.fromModule(monoscopeAssetSource);
        await asset.downloadAsync();
        const inputUri = asset.localUri || asset.uri;

        if (!inputUri) {
          throw new Error('Could not resolve asset URI');
        }

        const filmPayload = getActiveFilmPayload(customizedPayload);
        const previewUri = await generatePresetPreview(inputUri, filmPayload);
        
        if (active) {
          setTempThumbnailUri(previewUri);
          localTempUri = previewUri;
        } else {
          void deleteFile(previewUri);
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        console.error('Failed to generate preset preview:', error);
        if (error?.code && Object.values(CameraErrorCode).includes(error.code as CameraErrorCode)) {
          const detail = CAMERA_ERROR_DETAILS[error.code as CameraErrorCode];
          Alert.alert(
            detail.severity === 'fatal' ? t('presets.error_fatal', 'Errore Fatale') : t('presets.error_warning', 'Attenzione'),
            detail.description
          );
        }
      }
    };

    if (isAddModalVisible) {
      void generatePreview();
    }

    return () => {
      active = false;
      if (localTempUri && !isSavedRef.current) {
        void deleteFile(localTempUri);
      }
    };
  }, [isAddModalVisible, customizedPayload]);

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
    isSavedRef.current = true;
    addPreset(trimmedName, tempThumbnailUri || undefined);
    setNewPresetName('');
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
            onPress={() => {
              setNewPresetName('');
              setAddModalVisible(false);
            }}
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
            disabled={!newPresetName.trim()}
            style={[
              styles.modalButton,
              styles.modalSaveButton,
              !newPresetName.trim() && styles.modalSaveButtonDisabled
            ]}
          >
            <Text 
              style={[
                styles.modalButtonText,
                styles.modalSaveText,
                !newPresetName.trim() && styles.modalSaveTextDisabled
              ]} 
              allowFontScaling={false}
            >
              {t('presets.save', 'SALVA').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    borderColor: '#FF5722',
  },
  modalSaveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8e8e93',
    letterSpacing: 0.8,
  },
  modalSaveText: {
    color: '#FF5722',
  },
  modalSaveTextDisabled: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
});
