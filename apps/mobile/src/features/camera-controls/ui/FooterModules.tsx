import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';
import { SectionType, ModuleType } from '@shared/types/camera';

export const FooterModules = () => {
  const { activeSection, activeModule, setActiveModule, isDebugEnabled } = useUIStore(useShallow(state => ({
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
          keyboardShouldPersistTaps="handled"
        >
      {renderSection === 'system' && (
        <>
          <TouchableOpacity style={[styles.pill, renderModule === 'preferences' && styles.pillActive]} onPress={() => setActiveModule('preferences')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'preferences' && styles.pillTextActive]}>{t('modules.preferences')}</Text>
          </TouchableOpacity>
        </>
      )}
      {renderSection === 'lens' && (
        <>
          <TouchableOpacity style={[styles.pill, renderModule === 'optics' && styles.pillActive]} onPress={() => setActiveModule('optics')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'optics' && styles.pillTextActive]}>{t('modules.optics')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, renderModule === 'flaws' && styles.pillActive]} onPress={() => setActiveModule('flaws')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'flaws' && styles.pillTextActive]}>{t('modules.flaws')}</Text>
          </TouchableOpacity>
        </>
      )}
      {renderSection === 'body' && (
        <>
          <TouchableOpacity style={[styles.pill, renderModule === 'exposure' && styles.pillActive]} onPress={() => setActiveModule('exposure')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'exposure' && styles.pillTextActive]}>{t('modules.exposure')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, renderModule === 'lighting' && styles.pillActive]} onPress={() => setActiveModule('lighting')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'lighting' && styles.pillTextActive]}>{t('modules.lighting')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, renderModule === 'capture' && styles.pillActive]} onPress={() => setActiveModule('capture')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'capture' && styles.pillTextActive]}>{t('modules.capture')}</Text>
          </TouchableOpacity>
        </>
      )}
      {renderSection === 'film' && (
        <>
          <TouchableOpacity style={[styles.pill, renderModule === 'development' && styles.pillActive]} onPress={() => setActiveModule('development')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text style={[styles.pillText, renderModule === 'development' && styles.pillTextActive]}>{t('modules.development')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, renderModule === 'texture' && styles.pillActive]} onPress={() => setActiveModule('texture')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
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
    paddingTop: 0,
    marginBottom: 10,
  },
  sectionHeaderFrame: {
    width: '100%',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#FF9500',
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
    borderRadius: 0,
    backgroundColor: '#222',
    marginRight: 0,
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
