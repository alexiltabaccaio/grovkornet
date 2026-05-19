import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface IsoSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const IsoSubPanel = ({ parameterExtensionAnimatedStyle }: IsoSubPanelProps) => {
  const { iso, setIso, isoAuto, setIsoAuto, capabilities } = useHardwareStore(useShallow(state => ({
    iso: state.iso,
    setIso: state.setIso,
    isoAuto: state.isoAuto,
    setIsoAuto: state.setIsoAuto,
    capabilities: state.capabilities,
  })));

  const minIso = capabilities.isoMin ?? 50;
  const maxIso = capabilities.isoMax ?? 3200;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={iso}
          minValue={minIso}
          maxValue={maxIso}
          onChange={setIso}
          variant="slider"
          isAuto={isoAuto}
          valueFormatter={(v) => {
            'worklet';
            return `${Math.round(v)}`;
          }}
          hideValueInAuto={true}
          autoValueText="AUTO"
          onReset={() => setIsoAuto(true)}
          onToggleAuto={setIsoAuto}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    marginTop: -35,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
