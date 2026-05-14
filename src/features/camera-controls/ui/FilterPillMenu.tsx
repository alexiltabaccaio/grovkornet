import React from 'react';
import { StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';

export const FilterPillMenu = () => {
  const { activeTab, activeModule, setActiveModule } = useCameraEffectsStore(useShallow(state => ({
    activeTab: state.activeTab,
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule
  })));
  const { t } = useTranslation();
  
  if (activeTab !== 'color' && activeTab !== 'tape' && activeTab !== 'lens' && activeTab !== 'exposure' && activeTab !== 'settings') return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.pillMenuContainer}
      style={styles.pillMenuWrapper}
    >
      {activeTab === 'exposure' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'manual_exposure' && styles.pillActive]} onPress={() => setActiveModule('manual_exposure')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'manual_exposure' && styles.pillTextActive]}>{t('modules.manual_exposure')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'lens' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'lens_effects' && styles.pillActive]} onPress={() => setActiveModule('lens_effects')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'lens_effects' && styles.pillTextActive]}>{t('modules.chromatic_aberration')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'color' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'color_grading' && styles.pillActive]} onPress={() => setActiveModule('color_grading')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'color_grading' && styles.pillTextActive]}>{t('modules.color_grading')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'fade' && styles.pillActive]} onPress={() => setActiveModule('fade')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'fade' && styles.pillTextActive]}>{t('modules.fade')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'tape' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'grain' && styles.pillActive]} onPress={() => setActiveModule('grain')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'grain' && styles.pillTextActive]}>{t('modules.grain')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'jitter' && styles.pillActive]} onPress={() => setActiveModule('jitter')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'jitter' && styles.pillTextActive]}>{t('modules.jitter')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'dropouts' && styles.pillActive]} onPress={() => setActiveModule('dropouts')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'dropouts' && styles.pillTextActive]}>{t('modules.dropouts')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'settings' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'language' && styles.pillActive]} onPress={() => setActiveModule('language')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'language' && styles.pillTextActive]}>{t('modules.language')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'debug' && styles.pillActive]} onPress={() => setActiveModule('debug')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'debug' && styles.pillTextActive]}>{t('modules.debug')}</Text>
          </Pressable>
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
