import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { usePresetStore, Preset, DEFAULT_FILM_PAYLOAD, FilmPresetPayload, PresetStore, PresetPayload } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';
import { Asset } from 'expo-asset';
import { generatePresetPreview, deleteFile, CameraErrorCode, CAMERA_ERROR_DETAILS } from '@grovkornet/engine';
import { useFilmStore } from '@entities/film';
import { PopupContainer } from '@shared/ui/popup/PopupContainer';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const monoscopeAssetSource = require('../../../../assets/monoscope.jpg') as number;

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

import { addPreset, removePreset } from '../lib/presetActions';

const AddPresetModalComponent = () => {
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
  const [errorPopup, setErrorPopup] = useState<{ title: string; message: string } | null>(null);
  const [isOverwriteMode, setIsOverwriteMode] = useState(false);
  const [existingPresetId, setExistingPresetId] = useState<string | null>(null);
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddModalVisible, customizedPayload]);

  if (!isAddModalVisible) return null;

  const handleSavePreset = () => {
    const trimmedName = newPresetName.trim();
    if (!trimmedName) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorPopup({ title: t('presets.error_title', 'Errore'), message: t('presets.error_empty', 'Il nome non può essere vuoto') });
      return;
    }

    const isDuplicate = userPresets.some(
      (p: Preset) => p.name.toLowerCase() === trimmedName.toLowerCase() || trimmedName.toLowerCase() === 'default'
    );
    if (isDuplicate) {
      if (trimmedName.toLowerCase() === 'default') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorPopup({ title: t('presets.error_title', 'Errore'), message: t('presets.error_duplicate', 'Questo nome è già in uso') });
        return;
      }
      
      if (!isOverwriteMode) {
        const duplicatePreset = userPresets.find(
          (p: Preset) => p.name.toLowerCase() === trimmedName.toLowerCase()
        );
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsOverwriteMode(true);
        setExistingPresetId(duplicatePreset?.id || null);
        return;
      }
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    isSavedRef.current = true;

    if (isOverwriteMode && existingPresetId) {
      removePreset(existingPresetId);
    }

    addPreset(trimmedName, tempThumbnailUri || undefined);
    setNewPresetName('');
    setIsOverwriteMode(false);
    setExistingPresetId(null);
    setAddModalVisible(false);
  };

  return (
    <>
      <PopupContainer 
        visible={isAddModalVisible} 
        title={isOverwriteMode ? t('presets.overwrite_title', 'SOVRASCRIVERE PRESET?') : t('presets.save_title', 'SALVA PRESET')}
        onClose={() => {
          setNewPresetName('');
          setIsOverwriteMode(false);
          setExistingPresetId(null);
          setAddModalVisible(false);
        }}
      >
        <TextInput
          style={styles.textInput}
          placeholder={t('presets.placeholder', 'NOME PRESET')}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          value={newPresetName}
          onChangeText={(text) => {
            setNewPresetName(text);
            if (isOverwriteMode) {
              setIsOverwriteMode(false);
              setExistingPresetId(null);
            }
          }}
          autoFocus={true}
          maxLength={20}
          autoCapitalize="characters"
          selectTextOnFocus={true}
          allowFontScaling={false}
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={() => {
              if (isOverwriteMode) {
                setIsOverwriteMode(false);
                setExistingPresetId(null);
              } else {
                setNewPresetName('');
                setAddModalVisible(false);
              }
            }}
            activeOpacity={0.7}
            style={[styles.modalButton, styles.modalCancelButton]}
          >
            <Text style={styles.modalButtonText} allowFontScaling={false}>
              {isOverwriteMode ? t('common.no', 'NO') : t('presets.cancel', 'ANNULLA')}
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
              {isOverwriteMode ? t('common.yes', 'SI') : t('presets.save', 'SALVA').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </PopupContainer>

      <PopupContainer
        visible={!!errorPopup}
        title={errorPopup?.title}
        onClose={() => setErrorPopup(null)}
      >
        <Text style={styles.errorText} allowFontScaling={false}>
          {errorPopup?.message}
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={() => setErrorPopup(null)}
            activeOpacity={0.7}
            style={[styles.modalButton, styles.modalSaveButton]}
          >
            <Text style={[styles.modalButtonText, styles.modalSaveText]} allowFontScaling={false}>
              {t('common.ok', 'OK')}
            </Text>
          </TouchableOpacity>
        </View>
      </PopupContainer>
    </>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
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

export const AddPresetModal = React.memo(AddPresetModalComponent);
