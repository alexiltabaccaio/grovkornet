import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterExtensionWrapper } from '@features/camera-controls/ui/footer/components/ParameterExtensionWrapper';
import { useTranslation } from 'react-i18next';

interface DebugExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

interface DebugToggleButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  isGloballyEnabled: boolean;
}

const DebugToggleButton = ({ label, isActive, onPress, isGloballyEnabled }: DebugToggleButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: isActive ? '#FFF' : '#333',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: isActive ? '#FFF' : '#888',
    };
  });

  const greenStyle = isGloballyEnabled ? { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' } : {};

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Animated.View style={[
        styles.pillButton,
        animatedStyle,
        greenStyle
      ]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const DebugExtension = ({ parameterExtensionAnimatedStyle }: DebugExtensionProps) => {
  const { t } = useTranslation();
  const { isDebugEnabled, setIsDebugEnabled, isLogsEnabled, setIsLogsEnabled } = useUIStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
  })));

  const labelUI = t('parameters.debug_ui') ? t('parameters.debug_ui').toUpperCase() : 'UI';
  const labelLogs = t('parameters.debug_logs') ? t('parameters.debug_logs').toUpperCase() : 'LOGS';

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle} gap={16} paddingHorizontal={32}>
      <DebugToggleButton
        label={labelUI}
        isActive={isDebugEnabled}
        onPress={() => setIsDebugEnabled(!isDebugEnabled)}
        isGloballyEnabled={isDebugEnabled}
      />
      <DebugToggleButton
        label={labelLogs}
        isActive={isLogsEnabled}
        onPress={() => setIsLogsEnabled(!isLogsEnabled)}
        isGloballyEnabled={isDebugEnabled}
      />
    </ParameterExtensionWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 140,
  },
  pillButton: {
    height: 32,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
