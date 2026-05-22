import React from 'react';
import { StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import Share, { Social } from 'react-native-share';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CONFIG } from '@shared/config';
import { logger } from '@shared/lib/logger';

interface ShareButtonProps {
  uri: string;
  isVerified: boolean;
}

export const ShareButton = ({ uri, isVerified }: ShareButtonProps) => {
  const { t } = useTranslation();

  const handleShare = async () => {
    if (!isVerified) {
      Alert.alert(
        t('gallery.unverified_title', 'Unverified Photo'),
        t('gallery.unverified_message', 'This photo was not taken with Grovkornet or has been modified. Official brand sharing is disabled.')
      );
      return;
    }

    try {
      await Share.shareSingle({
        social: Social.InstagramStories,
        appId: CONFIG.APP_ID,
        backgroundImage: uri,
        backgroundBottomColor: '#000000',
        backgroundTopColor: '#000000',
        attributionURL: CONFIG.PLAY_STORE_URL,
      });
    } catch (error: unknown) {
      logger.error('ShareButton', 'Share error', error);
      try {
        await Share.open({
          url: uri,
          title: t('gallery.share_title', 'Share Photo'),
        });
      } catch (fallbackError: unknown) {
        logger.error('ShareButton', 'Fallback share error', fallbackError);
      }
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8}
      style={[styles.button, !isVerified && styles.buttonDisabled]}
      onPress={() => void handleShare()}
    >
      <Ionicons name="logo-instagram" size={20} color={isVerified ? "#FFF" : "#666"} />
      <Text style={[styles.text, !isVerified && styles.textDisabled]}>
        {isVerified ? t('gallery.share_instagram', 'Share to IG Stories') : t('gallery.unverified_badge', 'Unverified')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1306C',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  textDisabled: {
    color: '#666',
  },
});
