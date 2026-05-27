import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import { useSystemStore } from '@entities/system';
import { ParameterThumbView } from '@shared/ui/parameter-thumb';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const monoscopeAsset = require('../../../../../assets/monoscope.jpg') as ImageSourcePropType;

export const PresetsModule = () => {
  const {
    userPresets,
    activePresetId,
    customizedPayload,
    customizedThumbnailUri,
    applyPreset,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
      customizedPayload: s.customizedPayload,
      customizedThumbnailUri: s.customizedThumbnailUri,
      applyPreset: s.applyPreset,
    }))
  );

  const { setActiveParameter } = useSystemStore(
    useShallow((s) => ({
      setActiveParameter: s.setActiveParameter,
    }))
  );

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
        <TouchableOpacity activeOpacity={0.8} onPress={() => handlePresetPress('default')}>
          <ParameterThumbView
            label="Default"
            variant="preset"
            imageSource={monoscopeAsset}
            isActive={activePresetId === 'default'}
          />
        </TouchableOpacity>

        {customizedPayload && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => handlePresetPress('customized')}>
            <ParameterThumbView
              label="Personalizzato"
              variant="preset"
              imageSource={customizedThumbnailUri ? { uri: customizedThumbnailUri } : monoscopeAsset}
              isActive={activePresetId === 'customized'}
            />
          </TouchableOpacity>
        )}

        {userPresets.map((preset: Preset) => (
          <TouchableOpacity key={preset.id} activeOpacity={0.8} onPress={() => handlePresetPress(preset.id)}>
            <ParameterThumbView
              label={preset.name}
              variant="preset"
              imageSource={preset.thumbnailUri ? { uri: preset.thumbnailUri } : monoscopeAsset}
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
});

