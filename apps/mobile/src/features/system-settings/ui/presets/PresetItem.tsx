import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface PresetItemProps {
  id: string;
  name: string;
  isFavorite: boolean;
  inQuickSelect: boolean;
  isActive: boolean;
  isDefault?: boolean;
  isCustomized?: boolean;
  onApply: () => void;
  onToggleFavorite?: () => void;
  onToggleQuickSelect?: () => void;
  onDelete?: () => void;
}

export const PresetItem = ({
  id,
  name,
  isFavorite,
  inQuickSelect,
  isActive,
  isDefault = false,
  isCustomized = false,
  onApply,
  onToggleFavorite,
  onToggleQuickSelect,
  onDelete,
}: PresetItemProps) => {

  const handleApply = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onApply();
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onToggleFavorite();
    }
  };

  const handleToggleQuickSelect = () => {
    if (onToggleQuickSelect) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onToggleQuickSelect();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  return (
    <View
      style={[
        styles.container,
        isActive && styles.activeContainer,
        isCustomized && styles.customizedContainer,
      ]}
    >
      <TouchableOpacity
        onPress={handleApply}
        activeOpacity={0.7}
        style={styles.nameArea}
      >
        <Text
          style={[
            styles.nameText,
            isActive && styles.activeNameText,
            isCustomized && styles.customizedNameText,
          ]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {name}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionArea}>
        {/* Favorite Icon (only for saved user presets or Default) */}
        {!isCustomized && onToggleFavorite && (
          <TouchableOpacity
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
            style={styles.iconButton}
            accessibilityLabel="Favorite Preset"
          >
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={12}
              color={isFavorite ? '#FFCC00' : 'rgba(255, 255, 255, 0.25)'}
            />
          </TouchableOpacity>
        )}

        {/* Quick Select Pin Icon (only for user presets) */}
        {!isDefault && !isCustomized && onToggleQuickSelect && (
          <TouchableOpacity
            onPress={handleToggleQuickSelect}
            activeOpacity={0.7}
            style={styles.iconButton}
            accessibilityLabel="Pin to Quick Select"
          >
            <Ionicons
              name={inQuickSelect ? 'pin' : 'pin-outline'}
              size={11}
              color={inQuickSelect ? '#007AFF' : 'rgba(255, 255, 255, 0.25)'}
            />
          </TouchableOpacity>
        )}

        {/* Delete Icon (only for user presets) */}
        {!isDefault && !isCustomized && onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={styles.iconButton}
            accessibilityLabel="Delete Preset"
          >
            <Ionicons
              name="trash-outline"
              size={12}
              color="#FF453A"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    width: 105,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  activeContainer: {
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.06)',
  },
  customizedContainer: {
    borderColor: '#FF2D55',
    backgroundColor: 'rgba(255, 45, 85, 0.06)',
  },
  nameArea: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeNameText: {
    color: '#FFF',
    fontWeight: '900',
  },
  customizedNameText: {
    color: '#FF2D55',
    fontWeight: '900',
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 18,
    gap: 2,
  },
  iconButton: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
