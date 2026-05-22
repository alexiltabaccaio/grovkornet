import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { ParameterExtensionWrapper } from '@entities/system';

import { useTranslation } from 'react-i18next';
import { PillButton } from '@shared/ui';

interface DebugExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const DebugExtension = __DEV__ ? ({ parameterExtensionAnimatedStyle }: DebugExtensionProps) => {
  const { t } = useTranslation();
  const { isDebugEnabled, setIsDebugEnabled, isLogsEnabled, setIsLogsEnabled, isXRayEnabled, setIsXRayEnabled } = useSystemStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
    isXRayEnabled: state.isXRayEnabled,
    setIsXRayEnabled: state.setIsXRayEnabled,
  })));

  const labelUI = t('parameters.debug_ui') ? t('parameters.debug_ui').toUpperCase() : 'UI';
  const labelLogs = t('parameters.debug_logs') ? t('parameters.debug_logs').toUpperCase() : 'LOGS';

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle} gap={16} paddingHorizontal={32}>
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
        label="X-RAY"
        isActive={isXRayEnabled}
        onPress={() => setIsXRayEnabled(!isXRayEnabled)}
        isDebugEnabled={isDebugEnabled}
        style={styles.pressable}
      />
    </ParameterExtensionWrapper>
  );
} : () => null;

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 140,
  },
});
