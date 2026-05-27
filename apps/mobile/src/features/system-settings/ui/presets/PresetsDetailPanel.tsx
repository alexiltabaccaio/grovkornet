import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset } from '@entities/preset';
import { ParameterDetailPanelWrapper } from '@entities/system';
import * as Haptics from 'expo-haptics';
import { PresetItem } from './PresetItem';

interface PresetsDetailPanelProps {
  animatedStyle?: any;
}

export const PresetsDetailPanel = ({ animatedStyle }: PresetsDetailPanelProps) => {
  const { t } = useTranslation();
  const {
    userPresets,
    activePresetId,
    customizedPayload,
    removePreset,
    applyPreset,
    setFavoritePreset,
    toggleQuickSelect,
  } = usePresetStore(
    useShallow((s: any) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
      customizedPayload: s.customizedPayload,
      removePreset: s.removePreset,
      applyPreset: s.applyPreset,
      setFavoritePreset: s.setFavoritePreset,
      toggleQuickSelect: s.toggleQuickSelect,
    }))
  );

  const handleOpenAddModal = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    usePresetStore.getState().setAddModalVisible(true);
  };

  const handleToggleQuickSelect = (id: string) => {
    try {
      toggleQuickSelect(id);
    } catch (error: any) {
      if (error.message === 'LIMIT_EXCEEDED') {
        Alert.alert(
          t('presets.limit_title', 'Limite Raggiunto'),
          t('presets.limit_body', 'Puoi selezionare al massimo 5 preset per la scelta rapida')
        );
      }
    }
  };

  const handleDeletePress = (id: string, name: string) => {
    Alert.alert(
      t('presets.delete_title', 'Elimina Preset'),
      t('presets.delete_body', `Sei sicuro di voler eliminare "${name}"?`, { name }),
      [
        { text: t('presets.cancel', 'Annulla'), style: 'cancel' },
        {
          text: t('presets.delete', 'Elimina'),
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removePreset(id);
          },
        },
      ]
    );
  };

  const favoritePreset = userPresets.find((p: Preset) => p.isFavorite);

  return (
    <View style={styles.wrapper}>
      <ParameterDetailPanelWrapper
        animatedStyle={animatedStyle}
        scrollable={true}
        gap={8}
        paddingHorizontal={16}
        leftAccessory={
          <TouchableOpacity
            onPress={handleOpenAddModal}
            activeOpacity={0.7}
            style={styles.addButton}
            accessibilityLabel="Create Preset"
          >
            <Ionicons name="add" size={18} color="#FFF" />
          </TouchableOpacity>
        }
      >
        {/* 1. Default Preset (Immutable) */}
        <PresetItem
          id="default"
          name="Default"
          isFavorite={!favoritePreset}
          inQuickSelect={true}
          isActive={activePresetId === 'default'}
          isDefault={true}
          onApply={() => applyPreset('default')}
          onToggleFavorite={() => setFavoritePreset(null)}
        />

        {/* 2. Customized Preset (Runtime Unsaved State) */}
        {customizedPayload && (
          <PresetItem
            id="customized"
            name="Personalizzato"
            isFavorite={false}
            inQuickSelect={true}
            isActive={activePresetId === 'customized'}
            isCustomized={true}
            onApply={() => applyPreset('customized')}
          />
        )}

        {/* 3. User Saved Presets */}
        {userPresets.map((preset: Preset) => (
          <PresetItem
            key={preset.id}
            id={preset.id}
            name={preset.name}
            isFavorite={preset.isFavorite}
            inQuickSelect={preset.inQuickSelect}
            isActive={activePresetId === preset.id}
            onApply={() => applyPreset(preset.id)}
            onToggleFavorite={() => setFavoritePreset(preset.id)}
            onToggleQuickSelect={() => handleToggleQuickSelect(preset.id)}
            onDelete={() => handleDeletePress(preset.id, preset.name)}
          />
        ))}
      </ParameterDetailPanelWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  addButton: {
    width: 36,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
