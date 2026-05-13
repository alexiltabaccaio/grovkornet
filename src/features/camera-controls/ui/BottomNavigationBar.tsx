import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabType } from '@shared/types/camera';

interface BottomNavigationBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigationBar = ({ activeTab, onTabChange }: BottomNavigationBarProps) => {
  const tabs: { id: TabType; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: 'settings', icon: 'cog-outline', label: 'SETTINGS' },
    { id: 'lens', icon: 'aperture-outline', label: 'LENS' },
    { id: 'color', icon: 'color-palette-outline', label: 'COLOR' },
    { id: 'tape', icon: 'film-outline', label: 'TAPE' },
    { id: 'crt', icon: 'tv-outline', label: 'CRT' },
  ];

  return (
    <View style={styles.bottomFooter}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  bottomFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
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
