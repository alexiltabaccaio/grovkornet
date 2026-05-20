import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/components/ParameterControl';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';
import { useTranslation } from 'react-i18next';

interface DebugExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const DebugExtension = ({ parameterExtensionAnimatedStyle }: DebugExtensionProps) => {
  const { t } = useTranslation();
  const { isDebugEnabled, setIsDebugEnabled, isLogsEnabled, setIsLogsEnabled } = useUIStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
  })));

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle} gap={32}>
      <ParameterControl
        label={t('parameters.debug_ui')}
        isActive={isDebugEnabled}
        hideDebugRectangles={true}
        onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        variant="text"
        staticText={isDebugEnabled ? 'ON' : 'OFF'}
        isToggle={true}
      />
      <ParameterControl
        label={t('parameters.debug_logs')}
        isActive={isLogsEnabled}
        hideDebugRectangles={true}
        onPress={() => setIsLogsEnabled(!isLogsEnabled)}
        variant="text"
        staticText={isLogsEnabled ? 'ON' : 'OFF'}
        isToggle={true}
      />
    </ParameterExtensionWrapper>
  );
};

