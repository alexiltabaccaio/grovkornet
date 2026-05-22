import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { ParameterExtensionWrapper } from '@entities/system';

import { useSystemStore } from '@entities/system';
import { PillButton, AutoButton } from '@shared/ui';

interface NoiseReductionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const NoiseReductionExtension = ({ parameterExtensionAnimatedStyle }: NoiseReductionExtensionProps) => {
  const { noiseReductionMode, setNoiseReductionMode, noiseReductionAuto, setNoiseReductionAuto } = useFilmStore(useShallow(state => ({
    noiseReductionMode: state.noiseReductionMode,
    setNoiseReductionMode: state.setNoiseReductionMode,
    noiseReductionAuto: state.noiseReductionAuto,
    setNoiseReductionAuto: state.setNoiseReductionAuto,
  })));
  const isDebugEnabled = useSystemStore(s => s.isDebugEnabled);

  const isOffActive = useDerivedValue(() => noiseReductionMode.value === 0);
  const isFastActive = useDerivedValue(() => noiseReductionMode.value === 1);
  const isHqActive = useDerivedValue(() => noiseReductionMode.value === 2);

  return (
    <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
      <View style={{ width: 54, alignItems: 'flex-start' }}>
        <AutoButton
          isActive={noiseReductionAuto}
          onPress={() => setNoiseReductionAuto(!noiseReductionAuto.value)}
          isDebugEnabled={isDebugEnabled}
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <PillButton
          label="OFF"
          isActive={isOffActive}
          onPress={() => {
            setNoiseReductionAuto(false);
            setNoiseReductionMode(0);
          }}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressable}
        />
        <PillButton
          label="FAST"
          isActive={isFastActive}
          onPress={() => {
            setNoiseReductionAuto(false);
            setNoiseReductionMode(1);
          }}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressable}
        />
        <PillButton
          label="HQ"
          isActive={isHqActive}
          onPress={() => {
            setNoiseReductionAuto(false);
            setNoiseReductionMode(2);
          }}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressable}
        />
      </View>
      <View style={{ width: 54 }} />
    </ParameterExtensionWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 75,
  },
});
