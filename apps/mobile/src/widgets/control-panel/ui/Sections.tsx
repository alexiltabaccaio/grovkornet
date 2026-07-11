import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SectionType, useSystemStore, useControlPanelStore } from '@entities/system';
import { Ionicons } from '@expo/vector-icons';
import { Footer } from '@shared/ui';
import * as Haptics from '@shared/lib/haptics';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { useDeviceRotation } from '@shared/lib/hooks/useDeviceRotation';

import { useShallow } from 'zustand/shallow';

const { width } = Dimensions.get('window');

interface SectionsProps {
  galleryTransition?: SharedValue<number>;
  layoutSyncOffset?: SharedValue<number>;
}

export const Sections = React.memo(({ galleryTransition, layoutSyncOffset }: SectionsProps) => {
  const { activeSection, setActiveSection } = useControlPanelStore(useShallow(state => ({
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection,
  })));
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const { t } = useTranslation();
  const rotationY = useDeviceRotation();

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
    const offset = layoutSyncOffset?.value ?? 0;
    const translateX = interpolate(galleryTransition.value, [0, 1], [0, width]) + offset;
    
    return {
      transform: [
        { translateX }
      ],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationY.value}deg` }],
    };
  });

  return (
    <Footer style={styles.footerPosition}>
      <Animated.View style={[styles.tabContainer, animatedStyle]}>
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <View
              key={section.id}
              style={[styles.tabButton, isLayoutOverlayEnabled && styles.debugTabButton]}
            >
              {isLayoutOverlayEnabled && (
                <View testID="debug-hitbox" style={styles.debugHitbox} pointerEvents="none" />
              )}
              <TouchableOpacity
                onPress={() => handleSectionChange(section.id)}
                accessibilityLabel={t(`sections.${section.id}`)}
                accessibilityRole="tab"
                activeOpacity={0.7}
                testID={`section-button-${section.id}`}
                style={[
                  styles.iconWrapper,
                  isActive && styles.iconWrapperActive,
                ]}
              >
                <Animated.View style={animatedIconStyle}>
                  <Ionicons 
                    name={section.icon} 
                    size={24} 
                    color={isActive ? '#FF5722' : '#888'} 
                    testID={`section-icon-${section.id}`}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          );
        })}
      </Animated.View>
    </Footer>
  );

});

Sections.displayName = 'Sections';

const styles = StyleSheet.create({
  footerPosition: {
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
