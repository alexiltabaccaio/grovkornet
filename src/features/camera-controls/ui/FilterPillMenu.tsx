import React from 'react';
import { StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { TabType, ModuleType } from '@shared/types/camera';

interface FilterPillMenuProps {
  activeTab: TabType;
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

export const FilterPillMenu = ({ activeTab, activeModule, onModuleChange }: FilterPillMenuProps) => {
  if (activeTab !== 'color' && activeTab !== 'tape' && activeTab !== 'lens') return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.pillMenuContainer}
      style={styles.pillMenuWrapper}
    >
      {activeTab === 'lens' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'lens_effects' && styles.pillActive]} onPress={() => onModuleChange('lens_effects')}>
            <Text style={[styles.pillText, activeModule === 'lens_effects' && styles.pillTextActive]}>Aberrazione Cromatica</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'color' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'color_grading' && styles.pillActive]} onPress={() => onModuleChange('color_grading')}>
            <Text style={[styles.pillText, activeModule === 'color_grading' && styles.pillTextActive]}>Color Grading</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'fade' && styles.pillActive]} onPress={() => onModuleChange('fade')}>
            <Text style={[styles.pillText, activeModule === 'fade' && styles.pillTextActive]}>Fade</Text>
          </Pressable>
        </>
      )}
      {activeTab === 'tape' && (
        <>
          <Pressable style={[styles.pill, activeModule === 'grain' && styles.pillActive]} onPress={() => onModuleChange('grain')}>
            <Text style={[styles.pillText, activeModule === 'grain' && styles.pillTextActive]}>Grana</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'jitter' && styles.pillActive]} onPress={() => onModuleChange('jitter')}>
            <Text style={[styles.pillText, activeModule === 'jitter' && styles.pillTextActive]}>Jitter</Text>
          </Pressable>
          <Pressable style={[styles.pill, activeModule === 'dropouts' && styles.pillActive]} onPress={() => onModuleChange('dropouts')}>
            <Text style={[styles.pillText, activeModule === 'dropouts' && styles.pillTextActive]}>Dropouts</Text>
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
