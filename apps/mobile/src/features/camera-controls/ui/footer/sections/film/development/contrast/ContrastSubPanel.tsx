import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { ParameterControl } from '@features/camera-controls/ui/footer/ParameterControl';

interface ContrastSubPanelProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const ContrastSubPanel = ({ parameterExtensionAnimatedStyle }: ContrastSubPanelProps) => {
  const { contrast, setContrast } = useStylesStore(useShallow(state => ({
    contrast: state.contrast,
    setContrast: state.setContrast,
  })));

  return (
    <View style={styles.container}>
      {/* Parameter Extension: Slider Contrasto con 0 al centro (valore 1.0) */}
      <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={contrast}
          minValue={0}
          maxValue={2.0}
          centerValue={1.0}
          onChange={setContrast}
          variant="slider"
          renderValue={true}
          valueFormatter={(v) => {
            'worklet';
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : `${val}`;
          }}
          onReset={() => setContrast(1.0)}
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
