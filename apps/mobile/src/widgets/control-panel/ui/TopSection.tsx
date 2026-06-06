import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';

export const TopSection = React.memo(() => {
  const { activeSection, lastNonNoneSection, isLayoutOverlayEnabled } = useSystemStore(useShallow(state => ({
    activeSection: state.activeSection,
    lastNonNoneSection: state.lastNonNoneSection,
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled,
  })));
  const { t } = useTranslation();

  const renderSection = activeSection === 'none' ? lastNonNoneSection : activeSection;

  if (renderSection === 'none') return null;

  return (
    <View style={styles.container}>
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>
      <View style={[styles.sectionHeaderFrame, isLayoutOverlayEnabled && styles.debugFrame]}>
        <Text style={styles.sectionTitle} allowFontScaling={false}>
          {t(`sections.${renderSection}`)}
        </Text>
      </View>
    </View>
  );
});

TopSection.displayName = 'TopSection';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 24, // Compact height sharing handle and text
    position: 'relative',
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 4, // Flush with the top edge
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5722',
    opacity: 0.8,
  },
  sectionHeaderFrame: {
    width: '100%',
    position: 'absolute',
    top: 10, // Text sits immediately below the handle
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectionTitle: {
    color: '#FF5722',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  debugFrame: {
    borderColor: 'magenta',
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
});
