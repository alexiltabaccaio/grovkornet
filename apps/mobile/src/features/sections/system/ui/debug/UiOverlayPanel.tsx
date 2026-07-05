import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { ParameterPanelWrapper } from '@entities/system';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';

interface UiOverlayPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const UiOverlayPanelComponent = ({ animatedStyle }: UiOverlayPanelProps) => {
  const {
    isFpsOverlayEnabled,
    setIsFpsOverlayEnabled,
    isLayoutOverlayEnabled,
    setIsLayoutOverlayEnabled,
  } = useSystemStore(useShallow(state => ({
    isFpsOverlayEnabled: state.isFpsOverlayEnabled,
    setIsFpsOverlayEnabled: state.setIsFpsOverlayEnabled,
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled,
    setIsLayoutOverlayEnabled: state.setIsLayoutOverlayEnabled,
  })));

  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={16} paddingHorizontal={32} scrollable={true}>
      <PillButton
        label="FPS"
        isActive={isFpsOverlayEnabled}
        onPress={() => setIsFpsOverlayEnabled(!isFpsOverlayEnabled)}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.pressable}
      />
      <PillButton
        label="LAYOUT"
        isActive={isLayoutOverlayEnabled}
        onPress={() => setIsLayoutOverlayEnabled(!isLayoutOverlayEnabled)}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.pressable}
      />
    </ParameterPanelWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
  },
});

export const UiOverlayPanel = React.memo(UiOverlayPanelComponent);
