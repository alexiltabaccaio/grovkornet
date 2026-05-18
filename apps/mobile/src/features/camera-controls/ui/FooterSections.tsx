import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SectionType } from '@shared/types/camera';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';

export const FooterSections = () => {
  const { activeSection, setActiveSection, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection,
    isDebugEnabled: state.isDebugEnabled,
  })));
  const { t } = useTranslation();

  const handleSectionChange = (section: SectionType) => {
    const newSection = activeSection === section ? 'none' : section;
    setActiveSection(newSection);
  };

  const sections: { id: SectionType; label: string }[] = [
    { id: 'system', label: t('sections.system') },
    { id: 'lens', label: t('sections.lens') },
    { id: 'body', label: t('sections.body') },
    { id: 'film', label: t('sections.film') },
  ];

  return (
    <View style={styles.bottomFooterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {sections.map((section) => (
          <Pressable
            key={section.id}
            style={[styles.tabButton, isDebugEnabled && styles.debugTabButton]}
            onPress={() => handleSectionChange(section.id)}
          >
            {isDebugEnabled && (
              <View style={styles.debugHitbox} pointerEvents="none" />
            )}
            <Text style={[styles.tabLabel, activeSection === section.id && styles.tabLabelActive]}>{section.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomFooterWrapper: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#000',
  },

  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: '100%',
    paddingHorizontal: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  debugTabButton: {
    borderWidth: 1,
    borderColor: 'yellow',
  },
  debugHitbox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  tabLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FF9500',
  },
});
