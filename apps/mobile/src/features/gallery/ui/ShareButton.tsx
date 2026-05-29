import React from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Platform } from 'react-native';
import Share, { Social } from 'react-native-share';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '@shared/config';
import { logger } from '@shared/lib/logger';
import * as FileSystem from 'expo-file-system';

const getCachePath = (prefix: string) => {
  return `${FileSystem.cacheDirectory}${prefix}_${Date.now()}.jpg`;
};

interface ShareButtonProps {
  id?: string;
  uri: string;
  isVerified: boolean;
}

export const ShareButton = ({ id, uri, isVerified }: ShareButtonProps) => {
  const { t } = useTranslation();

  const handleInstagramShare = async () => {
    if (!isVerified) {
      Alert.alert(
        t('gallery.unverified_title', 'Unverified Photo'),
        t('gallery.unverified_message', 'This photo was not taken with Grovkornet or has been modified. Official brand sharing is disabled.')
      );
      return;
    }

    try {
      let shareUri = uri;
      
      // On Android, react-native-share expects a file:// URI and will automatically wrap it
      // with a FileProvider to create a content:// URI. Do NOT pass a content:// URI directly,
      // as it will parse the path incorrectly and pass an invalid FileProvider URI to Instagram.
      // Additionally, the original file might be in a public Pictures directory which react-native-share's
      // default FileProvider configuration does not expose. Therefore, we copy it to the cache directory first.
      if (Platform.OS === 'android') {
        const cachePath = getCachePath('share_instagram');
        await FileSystem.copyAsync({ from: uri, to: cachePath });
        shareUri = cachePath;
      }

      // Instagram Stories requires a numeric Facebook App ID. If CONFIG.APP_ID is not a number
      // (e.g. it defaults to the package name 'com.grovkornet.app'), we use a dummy numeric ID
      // to prevent the Instagram app from crashing/closing immediately.
      const isValidAppId = /^\d+$/.test(CONFIG.APP_ID);
      const appId = isValidAppId ? CONFIG.APP_ID : '123456789012345';
      
      if (!isValidAppId) {
        logger.warn('ShareButton', 'CONFIG.APP_ID is not a valid numeric Facebook App ID. Using dummy ID to prevent crash.');
      }

      logger.debug('ShareButton', `Sharing to Instagram Stories. appId: ${appId}, shareUri: ${shareUri}, originalUri: ${uri}, id: ${id}`);

      await Share.shareSingle({
        social: Social.InstagramStories,
        appId,
        backgroundImage: shareUri,
        backgroundBottomColor: '#000000',
        backgroundTopColor: '#000000',
        attributionURL: CONFIG.PLAY_STORE_URL,
      });
    } catch (error: unknown) {
      logger.error('ShareButton', 'Instagram share error. Falling back to generic share.', error);
      await handleGenericShare();
    }
  };

  const handleGenericShare = async () => {
    try {
      let shareUri = uri;
      
      if (Platform.OS === 'android') {
        // Copy the file to the cache to ensure react-native-share has 
        // the correct permissions via FileProvider (same workaround used for IG)
        const cachePath = getCachePath('share_generic');
        await FileSystem.copyAsync({ from: uri, to: cachePath });
        shareUri = cachePath;
      }

      await Share.open({
        url: shareUri,
        type: 'image/jpeg',
        title: t('gallery.share_title', 'Share Photo'),
      });
    } catch (error: unknown) {
      logger.error('ShareButton', 'Generic share error', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.iconButton, styles.igButton, !isVerified && styles.buttonDisabled]}
        onPress={() => void handleInstagramShare()}
        accessibilityLabel={isVerified ? t('gallery.share_instagram') : t('gallery.unverified_badge')}
      >
        <Ionicons name="logo-instagram" size={24} color={isVerified ? "#FFF" : "#666"} />
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.iconButton, styles.genericButton]}
        onPress={() => void handleGenericShare()}
        accessibilityLabel={t('gallery.share_generic')}
      >
        <Ionicons name="arrow-redo-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  igButton: {
    backgroundColor: '#E1306C',
  },
  genericButton: {
    backgroundColor: '#333',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
    elevation: 0,
  },
});
