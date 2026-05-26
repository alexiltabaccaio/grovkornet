import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ParameterDetailPanelWrapper } from '@entities/system';

import { useTranslation } from 'react-i18next';
import { PillButton } from '@shared/ui';

interface DebugDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

export const DebugDetailPanel = __DEV__ ? ({ parameterDetailPanelAnimatedStyle }: DebugDetailPanelProps) => {
  const { t } = useTranslation();
  const { isDebugEnabled, setIsDebugEnabled, isLogsEnabled, setIsLogsEnabled, isCameraSecure, setIsCameraSecure } = useSystemStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
    isCameraSecure: state.isCameraSecure,
    setIsCameraSecure: state.setIsCameraSecure,
  })));

  const labelUI = t('parameters.debug_ui') ? t('parameters.debug_ui').toUpperCase() : 'UI';
  const labelLogs = t('parameters.debug_logs') ? t('parameters.debug_logs').toUpperCase() : 'LOGS';
  const labelSecure = 'SECURE';

  return (
    <ParameterDetailPanelWrapper animatedStyle={parameterDetailPanelAnimatedStyle} gap={16} paddingHorizontal={32}>
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
    </ParameterDetailPanelWrapper>
  );
} : () => null;

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 140,
  },
});
