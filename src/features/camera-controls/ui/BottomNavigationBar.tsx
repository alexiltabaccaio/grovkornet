import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TabType } from '@shared/types/camera';

import { useShallow } from 'zustand/react/shallow';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';

export const BottomNavigationBar = () => {
  const { activeTab, setActiveTab, setActiveModule } = useCameraEffectsStore(useShallow(state => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    setActiveModule: state.setActiveModule
  })));
  const { t } = useTranslation();

  const handleTabChange = (tab: TabType) => {
    const newTab = activeTab === tab ? 'none' : tab;
    if (newTab === 'color') setActiveModule('color_grading');
    else if (newTab === 'tape') setActiveModule('grain');
    else if (newTab === 'lens') setActiveModule('lens_effects');
    else if (newTab === 'settings') setActiveModule('language');
    else setActiveModule('none');
    setActiveTab(newTab);
  };

  const tabs: { id: TabType; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'settings', icon: 'cog-outline', label: t('tabs.settings') },
    { id: 'lens', icon: 'aperture-outline', label: t('tabs.lens') },
    { id: 'color', icon: 'color-palette-outline', label: t('tabs.color') },
    { id: 'tape', icon: 'film-outline', label: t('tabs.tape') },
    { id: 'crt', icon: 'tv-outline', label: t('tabs.crt') },
  ];

  return (
    <View style={styles.bottomFooterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => handleTabChange(tab.id)}
            hitSlop={{ top: 20, bottom: 20, left: 15, right: 15 }}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomFooterWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
