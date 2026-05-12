import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut, SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { TabType } from '../types/camera';

interface FooterProps {
  enabled: SharedValue<boolean>;
  onGrainToggle: (val: boolean) => void;
  onTabChange: (tab: TabType) => void;
}

export const Footer = ({ 
  enabled, 
  onGrainToggle,
  onTabChange
}: FooterProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('grain');
  const [isGrainEnabled, setIsGrainEnabled] = useState(false);

  const handleToggle = (value: boolean) => {
    enabled.value = value;
    setIsGrainEnabled(value);
    onGrainToggle(value);
  };

  const handleTabChange = (tab: 'grain' | 'saturation') => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      {/* TOP FOOTER (CONTENT OF ACTIVE TAB) */}
      <View style={styles.topFooter}>
        {activeTab === 'grain' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
            <Pressable 
              style={styles.filterThumb}
              onPress={() => handleToggle(!isGrainEnabled)}
            >
              <View style={[
                styles.filterPlaceholder, 
                isGrainEnabled && styles.filterPlaceholderActive
              ]} />
              <Text style={[
                styles.filterText, 
                isGrainEnabled && styles.filterTextActive
              ]}>FILM GRAIN</Text>
            </Pressable>
          </Animated.View>
        )}

        {activeTab === 'saturation' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
             <View style={styles.emptyContent}>
                <Text style={styles.infoText}>ADJUST SATURATION USING THE SIDE SLIDER</Text>
             </View>
          </Animated.View>
        )}
      </View>

      {/* BOTTOM FOOTER (PARENT TABS) */}
      <View style={styles.bottomFooter}>
        <Pressable 
          style={styles.tabButton} 
          onPress={() => handleTabChange('grain')}
          hitSlop={15}
        >
          <Ionicons name="apps-outline" size={24} color={activeTab === 'grain' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'grain' && styles.tabLabelActive]}>GRAIN</Text>
        </Pressable>

        <Pressable 
          style={styles.tabButton} 
          onPress={() => handleTabChange('saturation')}
          hitSlop={15}
        >
          <Ionicons name="color-palette-outline" size={24} color={activeTab === 'saturation' ? "#FFF" : "#666"} />
          <Text style={[styles.tabLabel, activeTab === 'saturation' && styles.tabLabelActive]}>SATURATION</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  topFooter: {
    backgroundColor: '#000',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 24,
    paddingBottom: 20,
    minHeight: 140,
    justifyContent: 'center',
  },
  bottomFooter: {
    height: 90,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 10,
  },
  tabContent: {
    alignItems: 'center',
    width: '100%',
  },
  emptyContent: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
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
  },
  tabLabelActive: {
    color: '#FFF',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterThumb: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  filterPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#444',
    marginBottom: 8,
  },
  filterPlaceholderActive: {
    borderColor: '#FFF',
    backgroundColor: '#444',
  },
  filterText: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFF',
  },
});

