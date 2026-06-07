import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, useVisibleModules } from '@entities/system';
import { PillButton } from '@shared/ui';

export const Modules = React.memo(() => {
  const { 
    activeSection, 
    activeModule, 
    lastNonNoneSection,
    lastNonNoneModule,
    setActiveModule, 
    isLayoutOverlayEnabled 
  } = useSystemStore(useShallow(state => ({
    activeSection: state.activeSection,
    activeModule: state.activeModule,
    lastNonNoneSection: state.lastNonNoneSection,
    lastNonNoneModule: state.lastNonNoneModule,
    setActiveModule: state.setActiveModule,
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled
  })));
  const { t } = useTranslation();

  const renderSection = activeSection === 'none' ? lastNonNoneSection : activeSection;
  const renderModule = activeModule === 'none' ? lastNonNoneModule : activeModule;
  const visibleModules = useVisibleModules(renderSection);

  if (renderSection === 'none') return null;

  return (
    <>
      <View style={[styles.container, isLayoutOverlayEnabled && styles.debugContainerWrapper]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillMenuContainer}
          style={styles.pillMenuWrapper}
        >
          {visibleModules.map((moduleName) => (
            <PillButton
              key={moduleName}
              variant="module"
              label={t(`modules.${moduleName}`)}
              isActive={renderModule === moduleName}
              onPress={() => setActiveModule(moduleName)}
              isLayoutOverlayEnabled={isLayoutOverlayEnabled}
              style={styles.pill}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
});

Modules.displayName = 'Modules';

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
    color: '#FF5722',
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
