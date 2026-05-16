import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';

export const FooterModules = () => {
  const { activeSection, activeModule, setActiveModule, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule,
    isDebugEnabled: state.isDebugEnabled
  })));
  const { t } = useTranslation();

  if (activeSection === 'none') return null;

  return (
    <>
      <View style={[styles.sectionHeaderFrame, isDebugEnabled && styles.debugFrame]}>
        <Text style={styles.sectionTitle}>{t(`sections.${activeSection}`)}</Text>
      </View>
      <View style={styles.container}>
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
          <TouchableOpacity style={[styles.pill, activeModule === 'capture' && styles.pillActive]} onPress={() => setActiveModule('capture')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'capture' && styles.pillTextActive]}>{t('modules.capture')}</Text>
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
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 10,
  },
  sectionHeaderFrame: {
    width: '100%',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 0,
    marginBottom: 4,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  pillMenuWrapper: {
    maxHeight: 35,
  },
  pillMenuContainer: {
    alignItems: 'center',
    paddingRight: 32,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
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
  debugFrame: {
    borderWidth: 1,
    borderColor: 'magenta',
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
});
