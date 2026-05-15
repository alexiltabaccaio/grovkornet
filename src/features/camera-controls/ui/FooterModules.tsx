import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';

export const FooterModules = () => {
  const { activeSection, activeModule, setActiveModule } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule
  })));
  const { t } = useTranslation();
  
  const { capabilities } = useCameraEffectsStore(useShallow(state => ({
    capabilities: state.capabilities
  })));

  if (activeSection === 'none') return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.pillMenuContainer}
      style={styles.pillMenuWrapper}
    >
      {activeSection === 'system' && (
        <>
          <TouchableOpacity style={[styles.pill, activeModule === 'preferences' && styles.pillActive]} onPress={() => setActiveModule('preferences')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'preferences' && styles.pillTextActive]}>{t('modules.preferences')}</Text>
          </TouchableOpacity>
        </>
      )}
      {activeSection === 'lens' && (
        <>
          <TouchableOpacity style={[styles.pill, activeModule === 'optics' && styles.pillActive]} onPress={() => setActiveModule('optics')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'optics' && styles.pillTextActive]}>{t('modules.optics')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, activeModule === 'flaws' && styles.pillActive]} onPress={() => setActiveModule('flaws')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'flaws' && styles.pillTextActive]}>{t('modules.flaws')}</Text>
          </TouchableOpacity>
        </>
      )}
      {activeSection === 'body' && (
        <>
          <TouchableOpacity style={[styles.pill, activeModule === 'exposure' && styles.pillActive]} onPress={() => setActiveModule('exposure')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'exposure' && styles.pillTextActive]}>{t('modules.exposure')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, activeModule === 'lighting' && styles.pillActive]} onPress={() => setActiveModule('lighting')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'lighting' && styles.pillTextActive]}>{t('modules.lighting')}</Text>
          </TouchableOpacity>
        </>
      )}
      {activeSection === 'film' && (
        <>
          <TouchableOpacity style={[styles.pill, activeModule === 'development' && styles.pillActive]} onPress={() => setActiveModule('development')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'development' && styles.pillTextActive]}>{t('modules.development')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, activeModule === 'texture' && styles.pillActive]} onPress={() => setActiveModule('texture')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'texture' && styles.pillTextActive]}>{t('modules.texture')}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pillMenuWrapper: {
    maxHeight: 35,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  pillMenuContainer: {
    alignItems: 'center',
    paddingRight: 32,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#222',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#FFF',
  },
  pillText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#000',
  },
});
