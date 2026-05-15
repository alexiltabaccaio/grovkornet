import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SectionType } from '@shared/types/camera';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';

export const FooterSections = () => {
  const { activeSection, setActiveSection, setActiveModule, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection,
    setActiveModule: state.setActiveModule,
    isDebugEnabled: state.isDebugEnabled,
  })));
  const { t } = useTranslation();

  const handleSectionChange = (section: SectionType) => {
    const newSection = activeSection === section ? 'none' : section;
    if (newSection === 'system') setActiveModule('preferences');
    else if (newSection === 'lens') setActiveModule('optics');
    else if (newSection === 'body') setActiveModule('exposure');
    else if (newSection === 'film') setActiveModule('development');
    else setActiveModule('none');
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
            hitSlop={{ top: 20, bottom: 20, left: 0, right: 0 }}
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
    paddingTop: 16,
    paddingBottom: 16,
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
    paddingVertical: 4,
  },
  debugTabButton: {
    borderWidth: 1,
    borderColor: 'yellow',
  },
  debugHitbox: {
    position: 'absolute',
    top: -20,
    bottom: -20,
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
    color: '#FFF',
  },
});
