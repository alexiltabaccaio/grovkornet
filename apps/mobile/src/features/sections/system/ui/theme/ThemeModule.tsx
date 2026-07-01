import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { ParameterThumbView } from '@shared/ui/parameter-thumb';
import { AppPreviewThumbnail } from '@shared/ui/theme-thumbnail';

const MOCK_THEMES = [
  {
    id: 'grovkornet',
    label: 'Grovkornet',
    colors: {
      backgroundColor: '#0e0e0e', // Real background color of CameraScreen
      footerColor: '#121212', // Solid equivalent of rgba(18,18,18,0.75)
      bottomColor: '#0e0e0e', // Area behind the shutter button
      textColor: '#FF5722',
      shutterColor: '#FFFFFF',
    }
  },
  {
    id: 'light',
    label: 'Light',
    disabled: true,
    colors: {
      backgroundColor: '#E0E0E0',
      footerColor: '#CCCCCC',
      bottomColor: '#E0E0E0',
      textColor: '#FF3300',
      shutterColor: '#FF3300',
    }
  },
  {
    id: 'neon',
    label: 'Neon',
    disabled: true,
    colors: {
      backgroundColor: '#0F0F1A',
      footerColor: '#1A0F1A',
      bottomColor: '#0F0F1A',
      textColor: '#00FFCC',
      shutterColor: '#FF00FF',
    }
  },
  {
    id: 'monochrome',
    label: 'Mono',
    disabled: true,
    colors: {
      backgroundColor: '#333333',
      footerColor: '#222222',
      bottomColor: '#111111',
      textColor: '#FFFFFF',
      shutterColor: '#CCCCCC',
    }
  }
];

export const ThemeModule = React.memo(() => {
  const { t } = useTranslation();
  const [activeTheme, setActiveTheme] = useState('grovkornet');

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_THEMES.map((theme) => (
          <TouchableOpacity 
            key={theme.id} 
            activeOpacity={0.8} 
            onPress={() => setActiveTheme(theme.id)}
            disabled={theme.disabled}
            style={[theme.disabled && { opacity: 0.4 }]}
          >
            <ParameterThumbView
              label={theme.label}
              variant="preset"
              isActive={activeTheme === theme.id}
              thumbnailComponent={
                <AppPreviewThumbnail 
                  {...theme.colors} 
                  isActive={activeTheme === theme.id} 
                />
              }
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

ThemeModule.displayName = 'ThemeModule';

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
