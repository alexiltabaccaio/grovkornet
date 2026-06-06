import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ParameterPanelWrapper } from '@entities/system';

import { useTranslation } from 'react-i18next';
import { PillButton } from '@shared/ui';

interface DebugPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const DebugPanel = __DEV__ ? ({ animatedStyle }: DebugPanelProps) => {
  const { t } = useTranslation();
  const { 
    isDebugEnabled, 
    setIsDebugEnabled, 
    isLogsEnabled, 
    setIsLogsEnabled, 
    isCameraSecure, 
    setIsCameraSecure,
    thermalState,
    setThermalState
  } = useSystemStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
    isCameraSecure: state.isCameraSecure,
    setIsCameraSecure: state.setIsCameraSecure,
    thermalState: state.thermalState,
    setThermalState: state.setThermalState,
  })));

  const labelUI = t('parameters.debug_ui') ? t('parameters.debug_ui').toUpperCase() : 'UI';
  const labelLogs = t('parameters.debug_logs') ? t('parameters.debug_logs').toUpperCase() : 'LOGS';
  const labelSecure = 'SECURE';

  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={16} paddingHorizontal={32} scrollable={true}>
      <PillButton
        label={labelUI}
        isActive={isDebugEnabled}
        onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
      <PillButton
        label={labelLogs}
        isActive={isLogsEnabled}
        onPress={() => setIsLogsEnabled(!isLogsEnabled)}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
      <PillButton
        label={labelSecure}
        isActive={isCameraSecure}
        onPress={() => setIsCameraSecure(!isCameraSecure)}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
      <PillButton
        label="TEMP: NORMAL"
        isActive={thermalState === 'normal'}
        onPress={() => setThermalState('normal')}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
      <PillButton
        label="TEMP: WARNING"
        isActive={thermalState === 'warning'}
        onPress={() => setThermalState('warning')}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
      <PillButton
        label="TEMP: CRITICAL"
        isActive={thermalState === 'critical'}
        onPress={() => setThermalState('critical')}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
    </ParameterPanelWrapper>
  );
} : () => null;

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
  },
});
