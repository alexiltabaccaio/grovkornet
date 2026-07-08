import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface PopupContainerProps {
  visible: boolean;
  title?: string;
  onClose?: () => void;
  accessibilityLabel?: string;
  children: React.ReactNode;
}

export const PopupContainer: React.FC<PopupContainerProps> = ({
  visible,
  title,
  onClose,
  accessibilityLabel,
  children,
}) => {
  if (!visible) return null;

  return (
    <Animated.View 
      style={styles.modalOverlay} 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(200)}
    >
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={onClose} 
        accessibilityLabel={accessibilityLabel}
        testID="popup-overlay"
      />
      <View style={styles.modalContent}>
        {title && (
          <Text style={styles.modalTitle} allowFontScaling={false}>
            {title}
          </Text>
        )}
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  modalContent: {
    width: '80%',
    maxWidth: 290,
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF5722',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
