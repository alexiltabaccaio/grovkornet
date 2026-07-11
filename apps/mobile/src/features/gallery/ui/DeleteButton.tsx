import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { PopupContainer } from '@shared/ui/popup/PopupContainer';
import { useDeviceRotation } from '@shared/lib/hooks/useDeviceRotation';
import { GalleryItem } from '../lib/types';

interface DeleteButtonProps {
  photo: GalleryItem;
  onDelete: (photo: GalleryItem) => Promise<void>;
}

export const DeleteButton = React.memo(({ photo, onDelete }: DeleteButtonProps) => {
  const { t } = useTranslation();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const rotationY = useDeviceRotation();

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationY.value}deg` }],
    };
  });

  const executeDelete = async () => {
    setIsPopupVisible(false);
    setIsDeleting(true);
    try {
      await onDelete(photo);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePress = () => {
    const isTemp = photo.uri.startsWith('file:///data/') || photo.id === 'preview-temp' || photo.uri.includes('preview') || photo.uri.includes('temp');
    
    if (isTemp || (Platform.OS === 'android' && (Platform.Version as number) >= 30)) {
      void executeDelete();
    } else {
      setIsPopupVisible(true);
    }
  };

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.iconButton}
        onPress={handlePress}
        disabled={isDeleting}
        accessibilityLabel={t('gallery.delete_button', 'Delete Photo')}
        testID="delete-photo-button"
      >
        <Animated.View style={iconStyle}>
          <Ionicons name="trash-outline" size={24} color="#FF5722" />
        </Animated.View>
      </TouchableOpacity>

      <PopupContainer
        visible={isPopupVisible}
        title={t('gallery.delete_confirm_title', 'Delete Photo')}
        onClose={() => setIsPopupVisible(false)}
        accessibilityLabel={t('gallery.delete_confirm_title', 'Delete Photo')}
      >
        <Text style={styles.confirmText} allowFontScaling={false}>
          {t('gallery.delete_confirm_message', 'Are you sure you want to permanently delete this photo?')}
        </Text>
        <View style={styles.popupButtons}>
          <TouchableOpacity
            style={[styles.popupButton, styles.cancelButton]}
            onPress={() => setIsPopupVisible(false)}
            testID="delete-popup-cancel"
          >
            <Text style={styles.cancelButtonText} allowFontScaling={false}>
              {t('presets.cancel', 'CANCEL')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.popupButton, styles.confirmButton]}
            onPress={() => void executeDelete()}
            testID="delete-popup-confirm"
          >
            <Text style={styles.confirmButtonText} allowFontScaling={false}>
              {t('presets.delete', 'DELETE')}
            </Text>
          </TouchableOpacity>
        </View>
      </PopupContainer>
    </View>
  );
});

DeleteButton.displayName = 'DeleteButton';

const styles = StyleSheet.create({
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  popupButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  popupButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#222',
  },
  confirmButton: {
    backgroundColor: '#FF5722',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
