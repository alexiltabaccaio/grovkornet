import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface AuthenticityBadgeProps {
  verifying: boolean;
  isVerified?: boolean;
}

export const AuthenticityBadge = ({ verifying, isVerified }: AuthenticityBadgeProps) => {
  const { t } = useTranslation();

  if (verifying) {
    return (
      <View style={styles.badgeContainer}>
        <ActivityIndicator size="small" color="#FF9500" />
        <Text style={styles.badgeText}>{t('gallery.verifying', 'Verifying...')}</Text>
      </View>
    );
  }

  if (isVerified) {
    return (
      <View style={[styles.badgeContainer, styles.badgeVerified]}>
        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
        <Text style={[styles.badgeText, styles.badgeTextVerified]}>
          {t('gallery.verified', 'Verified Original')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badgeContainer, styles.badgeUnverified]}>
      <Ionicons name="alert-circle" size={16} color="#FF3B30" />
      <Text style={[styles.badgeText, styles.badgeTextUnverified]}>
        {t('gallery.unverified', 'Unverified')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    zIndex: 10,
  },
  badgeVerified: {
    borderColor: 'rgba(52, 199, 89, 0.5)',
    backgroundColor: 'rgba(20, 40, 20, 0.85)',
  },
  badgeUnverified: {
    borderColor: 'rgba(255, 59, 48, 0.5)',
    backgroundColor: 'rgba(40, 20, 20, 0.85)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  badgeTextVerified: {
    color: '#34C759',
  },
  badgeTextUnverified: {
    color: '#FF3B30',
  },
});
