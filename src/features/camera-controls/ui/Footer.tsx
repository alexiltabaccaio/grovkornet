import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';
import { FooterTabs } from './FooterTabs';
import { FooterModules } from './FooterModules';
import { FooterParameters } from './FooterParameters';

export const Footer = () => {
  const { activeTab } = useUIStore(useShallow(state => ({
    activeTab: state.activeTab,
  })));

  return (
    <View style={styles.container}>
      {activeTab !== 'none' && (
        <View style={styles.topFooter}>
          <FooterModules />
          <FooterParameters />
        </View>
      )}

      <FooterTabs />
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
    zIndex: 100,
  },
  topFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: 10,
    height: 120,
    justifyContent: 'flex-end',
  },
});
