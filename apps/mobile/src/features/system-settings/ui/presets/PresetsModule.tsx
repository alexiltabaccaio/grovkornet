import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset } from '@entities/preset';
import { useSystemStore } from '@entities/system';
import { ParameterThumbView } from '@shared/ui/parameter-thumb';
import * as Haptics from 'expo-haptics';

export const PresetsModule = () => {
  const { t } = useTranslation();
  const {
    userPresets,
    activePresetId,
    customizedPayload,
    applyPreset,
    setAddModalVisible,
  } = usePresetStore(
    useShallow((s: any) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
      customizedPayload: s.customizedPayload,
      applyPreset: s.applyPreset,
      setAddModalVisible: s.setAddModalVisible,
    }))
  );

  const { activeParameter, setActiveParameter } = useSystemStore(
    useShallow((s) => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const handleOpenAddModal = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAddModalVisible(true);
  }, [setAddModalVisible]);

  const handlePresetPress = useCallback((id: string) => {
    applyPreset(id);
    setActiveParameter('presets');
  }, [applyPreset, setActiveParameter]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={handleOpenAddModal}
          activeOpacity={0.7}
          style={styles.addButton}
          accessibilityLabel="Create Preset"
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => handlePresetPress('default')}>
          <ParameterThumbView
            label="Default"
            isActive={activePresetId === 'default'}
          />
        </TouchableOpacity>

        {customizedPayload && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => handlePresetPress('customized')}>
            <ParameterThumbView
              label="Personalizzato"
              isActive={activePresetId === 'customized'}
            />
          </TouchableOpacity>
        )}

        {userPresets.map((preset: Preset) => (
          <TouchableOpacity key={preset.id} activeOpacity={0.8} onPress={() => handlePresetPress(preset.id)}>
            <ParameterThumbView
              label={preset.name}
              isActive={activePresetId === preset.id}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});
