import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TabType } from '@shared/types/camera';

interface BottomNavigationBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigationBar = ({ activeTab, onTabChange }: BottomNavigationBarProps) => {
  const { t } = useTranslation();
  
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
            onPress={() => onTabChange(tab.id)}
            hitSlop={15}
          >
            <Ionicons name={tab.icon} size={24} color={activeTab === tab.id ? "#FFF" : "#666"} />
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: '100%',
    paddingHorizontal: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFF',
  },
});
