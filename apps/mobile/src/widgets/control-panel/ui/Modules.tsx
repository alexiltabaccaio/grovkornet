import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, SectionType, ModuleType } from '@entities/system';
import { PillButton } from '@shared/ui';

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

  useEffect(() => {
    if (activeSection !== 'none') {
      setLastActiveSection(activeSection);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeModule !== 'none') {
      setLastActiveModule(activeModule);
    }
  }, [activeModule]);

  const renderSection = activeSection === 'none' ? lastActiveSection : activeSection;
  const renderModule = activeModule === 'none' ? lastActiveModule : activeModule;

  if (renderSection === 'none') return null;

  return (
    <>
      <View style={[styles.sectionHeaderFrame, isDebugEnabled && styles.debugFrame]}>
        <Text style={styles.sectionTitle}>{t(`sections.${renderSection}`)}</Text>
      </View>
      <View style={[styles.container, isDebugEnabled && styles.debugContainerWrapper]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillMenuContainer}
          style={styles.pillMenuWrapper}
        >
          {renderSection === 'system' && (
            <>
              <PillButton
                variant="module"
                label={t('modules.preferences')}
                isActive={renderModule === 'preferences'}
                onPress={() => setActiveModule('preferences')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
            </>
          )}
          {renderSection === 'lens' && (
            <>
              <PillButton
                variant="module"
                label={t('modules.optics')}
                isActive={renderModule === 'optics'}
                onPress={() => setActiveModule('optics')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
              <PillButton
                variant="module"
                label={t('modules.flaws')}
                isActive={renderModule === 'flaws'}
                onPress={() => setActiveModule('flaws')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
            </>
          )}
          {renderSection === 'body' && (
            <>
              <PillButton
                variant="module"
                label={t('modules.exposure')}
                isActive={renderModule === 'exposure'}
                onPress={() => setActiveModule('exposure')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
              <PillButton
                variant="module"
                label={t('modules.lighting')}
                isActive={renderModule === 'lighting'}
                onPress={() => setActiveModule('lighting')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
              <PillButton
                variant="module"
                label={t('modules.capture')}
                isActive={renderModule === 'capture'}
                onPress={() => setActiveModule('capture')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
            </>
          )}
          {renderSection === 'film' && (
            <>
              <PillButton
                variant="module"
                label={t('modules.development')}
                isActive={renderModule === 'development'}
                onPress={() => setActiveModule('development')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
              <PillButton
                variant="module"
                label={t('modules.texture')}
                isActive={renderModule === 'texture'}
                onPress={() => setActiveModule('texture')}
                isDebugEnabled={isDebugEnabled}
                style={styles.pill}
              />
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
    marginRight: 8,
  },
  debugFrame: {
    borderColor: 'magenta',
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
  debugContainerWrapper: {
    borderWidth: 1,
    borderColor: 'cyan',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
});
