import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, SectionType, ModuleType } from '@entities/system';

export const Modules = () => {
  const { activeSection, activeModule, setActiveModule, isDebugEnabled } = useSystemStore(useShallow(state => ({
    activeSection: state.activeSection,
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule,
    isDebugEnabled: state.isDebugEnabled
  })));
  const { t } = useTranslation();

  const [lastActiveSection, setLastActiveSection] = useState<SectionType>(activeSection);
  const [lastActiveModule, setLastActiveModule] = useState<ModuleType>(activeModule);

  if (activeSection !== 'none' && activeSection !== lastActiveSection) {
    setLastActiveSection(activeSection);
  }
  if (activeModule !== 'none' && activeModule !== lastActiveModule) {
    setLastActiveModule(activeModule);
  }

  const renderSection = activeSection === 'none' ? lastActiveSection : activeSection;
  const renderModule = activeModule === 'none' ? lastActiveModule : activeModule;

  if (renderSection === 'none') return null;

  return (
    <>
      <View style={[styles.sectionHeaderFrame, isDebugEnabled && styles.debugFrame]}>
        <Text style={styles.sectionTitle}>{t(`sections.${renderSection}`)}</Text>
      </View>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillMenuContainer}
          style={styles.pillMenuWrapper}
        >
          {renderSection === 'system' && (
            <>
              <TouchableOpacity style={[styles.pill, renderModule === 'preferences' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('preferences')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'preferences' && styles.pillTextActive]}>{t('modules.preferences')}</Text>
              </TouchableOpacity>
            </>
          )}
          {renderSection === 'lens' && (
            <>
              <TouchableOpacity style={[styles.pill, renderModule === 'optics' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('optics')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'optics' && styles.pillTextActive]}>{t('modules.optics')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, renderModule === 'flaws' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('flaws')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'flaws' && styles.pillTextActive]}>{t('modules.flaws')}</Text>
              </TouchableOpacity>
            </>
          )}
          {renderSection === 'body' && (
            <>
              <TouchableOpacity style={[styles.pill, renderModule === 'exposure' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('exposure')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'exposure' && styles.pillTextActive]}>{t('modules.exposure')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, renderModule === 'lighting' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('lighting')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'lighting' && styles.pillTextActive]}>{t('modules.lighting')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, renderModule === 'capture' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('capture')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'capture' && styles.pillTextActive]}>{t('modules.capture')}</Text>
              </TouchableOpacity>
            </>
          )}
          {renderSection === 'film' && (
            <>
              <TouchableOpacity style={[styles.pill, renderModule === 'development' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('development')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'development' && styles.pillTextActive]}>{t('modules.development')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, renderModule === 'texture' && styles.pillActive, isDebugEnabled && styles.debugPill]} onPress={() => setActiveModule('texture')} activeOpacity={0.7}>
                <Text style={[styles.pillText, renderModule === 'texture' && styles.pillTextActive]}>{t('modules.texture')}</Text>
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
    marginTop: 2,
    marginBottom: 2,
  },
  sectionHeaderFrame: {
    width: '100%',
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectionTitle: {
    color: '#FF9500',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
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
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#2C2C2E',
  },
  pillText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFF',
  },
  debugFrame: {
    borderColor: 'magenta',
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
  debugPill: {
    borderColor: 'cyan',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
  },
});
