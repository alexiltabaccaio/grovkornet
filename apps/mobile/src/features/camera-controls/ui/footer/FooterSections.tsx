import React from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SectionType } from '@shared/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

export const FooterSections = () => {
  const { activeSection, setActiveSection, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection,
    isDebugEnabled: state.isDebugEnabled,
  })));
  const { t } = useTranslation();

  const handleSectionChange = (section: SectionType) => {
    if (section === activeSection) {
      setActiveSection('none');
    } else {
      setActiveSection(section);
    }
  };

  const sections: { id: SectionType; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'system', icon: 'settings-outline' },
    { id: 'lens', icon: 'aperture-outline' },
    { id: 'body', icon: 'camera-outline' },
    { id: 'film', icon: 'film-outline' },
  ];

  return (
    <View style={styles.bottomFooterWrapper}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <Pressable
              key={section.id}
              style={[styles.tabButton, isDebugEnabled && styles.debugTabButton]}
              onPress={() => handleSectionChange(section.id)}
              accessibilityLabel={t(`sections.${section.id}`)}
              accessibilityRole="tab"
            >
              {isDebugEnabled && (
                <View style={styles.debugHitbox} pointerEvents="none" />
              )}
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Ionicons 
                  name={section.icon} 
                  size={24} 
                  color={isActive ? '#FF9500' : '#888'} 
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomFooterWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'black',
    borderTopWidth: 1,
    borderTopColor: '#222',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
  },

  scrollContent: {
    flexDirection: 'row',
    flexGrow: 1,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
  },
  debugTabButton: {
    borderColor: 'orange',
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
});
