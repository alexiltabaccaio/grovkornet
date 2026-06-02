import React, { useCallback } from 'react';
import { StyleSheet, View, ImageSourcePropType } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { usePresetStore, Preset, PresetStore } from '@entities/preset';
import { useSystemStore } from '@entities/system';
import { ParameterThumbView } from '@shared/ui/parameter-thumb';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const monoscopeAsset = require('../../../../../assets/monoscope.jpg') as ImageSourcePropType;

interface PresetButtonProps {
  id: string;
  label: string;
  thumbnailUri?: string | null;
  isActive: boolean;
  onPress: (id: string) => void;
}

const PresetButton = React.memo(({ id, label, thumbnailUri, isActive, onPress }: PresetButtonProps) => {
  const handlePress = useCallback(() => {
    onPress(id);
  }, [onPress, id]);

  const imageSource = thumbnailUri ? { uri: thumbnailUri } : monoscopeAsset;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <ParameterThumbView
        label={label}
        variant="preset"
        imageSource={imageSource}
        isActive={isActive}
      />
    </TouchableOpacity>
  );
});

PresetButton.displayName = 'PresetButton';

import { applyPreset } from '../../lib/presetActions';

export const PresetsModule = () => {
  const {
    userPresets,
    activePresetId,
    customizedPayload,
    customizedThumbnailUri,
  } = usePresetStore(
    useShallow((s: PresetStore) => ({
      userPresets: s.userPresets,
      activePresetId: s.activePresetId,
      customizedPayload: s.customizedPayload,
      customizedThumbnailUri: s.customizedThumbnailUri,
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
  }, [setActiveParameter]);

  const sortedUserPresets = React.useMemo(() => {
    return [...userPresets].sort((a, b) => {
      // 1. Favorite preset first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // 2. Quick select (pinned) next
      if (a.inQuickSelect && !b.inQuickSelect) return -1;
      if (!a.inQuickSelect && b.inQuickSelect) return 1;

      // 3. Alphabetical sorting
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
    });
  }, [userPresets]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PresetButton
          id="default"
          label="Default"
          isActive={activePresetId === 'default'}
          onPress={handlePresetPress}
        />

        {customizedPayload && (
          <PresetButton
            id="customized"
            label="Personalizzato"
            thumbnailUri={customizedThumbnailUri}
            isActive={activePresetId === 'customized'}
            onPress={handlePresetPress}
          />
        )}

        {sortedUserPresets.map((preset: Preset) => (
          <PresetButton
            key={preset.id}
            id={preset.id}
            label={preset.name}
            thumbnailUri={preset.thumbnailUri}
            isActive={activePresetId === preset.id}
            onPress={handlePresetPress}
          />
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

// PresetsModule.whyDidYouRender = true;


