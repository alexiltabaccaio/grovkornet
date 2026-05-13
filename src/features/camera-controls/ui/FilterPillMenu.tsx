import React from 'react';
import { StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabType, ModuleType } from '@shared/types/camera';

interface FilterPillMenuProps {
  activeTab: TabType;
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

export const FilterPillMenu = ({ activeTab, activeModule, onModuleChange }: FilterPillMenuProps) => {
  const { t } = useTranslation();
  
  if (activeTab !== 'color' && activeTab !== 'tape' && activeTab !== 'lens' && activeTab !== 'settings') return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.pillMenuContainer}
      style={styles.pillMenuWrapper}
    >
      {activeTab === 'lens' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'lens_effects' && styles.pillActive]} onPress={() => onModuleChange('lens_effects')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'lens_effects' && styles.pillTextActive]}>{t('modules.chromatic_aberration')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'color' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'color_grading' && styles.pillActive]} onPress={() => onModuleChange('color_grading')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'color_grading' && styles.pillTextActive]}>{t('modules.color_grading')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'fade' && styles.pillActive]} onPress={() => onModuleChange('fade')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'fade' && styles.pillTextActive]}>{t('modules.fade')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'tape' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'grain' && styles.pillActive]} onPress={() => onModuleChange('grain')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'grain' && styles.pillTextActive]}>{t('modules.grain')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'jitter' && styles.pillActive]} onPress={() => onModuleChange('jitter')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'jitter' && styles.pillTextActive]}>{t('modules.jitter')}</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'dropouts' && styles.pillActive]} onPress={() => onModuleChange('dropouts')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'dropouts' && styles.pillTextActive]}>{t('modules.dropouts')}</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'settings' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'language' && styles.pillActive]} onPress={() => onModuleChange('language')} hitSlop={10}>
            <Text style={[styles.pillText, activeModule === 'language' && styles.pillTextActive]}>{t('modules.language')}</Text>
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
