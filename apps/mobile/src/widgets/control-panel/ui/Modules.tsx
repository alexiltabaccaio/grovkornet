import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useShallow } from 'zustand/shallow';
import { useSystemStore, useControlPanelStore, ModuleType } from '@entities/system';
import { PillButton } from '@shared/ui';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { useResetTool } from '../lib/useResetTool';
import { useVisibleModules } from '../lib/useVisibleModules';
import { MODULE_PARAMETERS } from '../config/moduleParameters';

export const Modules = () => {
  const { 
    activeSection, 
    activeModule, 
    lastNonNoneSection,
    lastNonNoneModule,
    setActiveModule 
  } = useControlPanelStore(useShallow(state => ({
    activeSection: state.activeSection,
    activeModule: state.activeModule,
    lastNonNoneSection: state.lastNonNoneSection,
    lastNonNoneModule: state.lastNonNoneModule,
    setActiveModule: state.setActiveModule,
  })));
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const { t } = useTranslation();
  const resetTool = useResetTool();

  const { handlePressWithDouble } = useDoublePress<ModuleType>((moduleName) => {
    const paramsToReset = MODULE_PARAMETERS[moduleName as keyof typeof MODULE_PARAMETERS];
    if (paramsToReset) {
      paramsToReset.forEach((param) => {
        resetTool(param);
      });
    }
  });

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
              onPress={() => handlePressWithDouble(moduleName, () => setActiveModule(moduleName))}
              isLayoutOverlayEnabled={isLayoutOverlayEnabled}
              style={styles.pill}
            />
          ))}
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
  debugContainerWrapper: {
    borderWidth: 1,
    borderColor: 'cyan',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
});
