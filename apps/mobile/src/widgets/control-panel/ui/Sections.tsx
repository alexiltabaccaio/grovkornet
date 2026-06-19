import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SectionType, useSystemStore, useControlPanelStore } from '@entities/system';
import { Ionicons } from '@expo/vector-icons';
import { BottomFooter } from '@shared/ui';
import * as Haptics from '@shared/lib/haptics';
import { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';

import { useShallow } from 'zustand/shallow';

const { width } = Dimensions.get('window');

interface SectionsProps {
  galleryTransition?: SharedValue<number>;
}

export const Sections = React.memo(({ galleryTransition }: SectionsProps) => {
  const { activeSection, setActiveSection } = useControlPanelStore(useShallow(state => ({
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection,
  })));
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const { t } = useTranslation();

  const handleSectionChange = (section: SectionType) => {
    void Haptics.selectionAsync();
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

  const animatedStyle = useAnimatedStyle(() => {
    if (!galleryTransition) return {};
    const translateX = interpolate(galleryTransition.value, [0, 1], [0, width]);
    
    return {
      transform: [
        { translateX }
      ],
    };
  });

  return (
    <BottomFooter style={[styles.bottomFooterPosition, animatedStyle]}>
      <View style={styles.tabContainer}>
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <View
              key={section.id}
              style={[styles.tabButton, isLayoutOverlayEnabled && styles.debugTabButton]}
            >
              {isLayoutOverlayEnabled && (
                <View style={styles.debugHitbox} pointerEvents="none" />
              )}
              <TouchableOpacity
                onPress={() => handleSectionChange(section.id)}
                accessibilityLabel={t(`sections.${section.id}`)}
                accessibilityRole="tab"
                activeOpacity={0.7}
                style={[
                  styles.iconWrapper,
                  isActive && styles.iconWrapperActive,
                ]}
              >
                <Ionicons 
                  name={section.icon} 
                  size={24} 
                  color={isActive ? '#FF5722' : '#888'} 
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </BottomFooter>
  );

});

Sections.displayName = 'Sections';

const styles = StyleSheet.create({
  bottomFooterPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  tabContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
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
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
  },
  iconWrapperPressed: {
    backgroundColor: 'rgba(255, 87, 34, 0.25)',
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
