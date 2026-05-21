import React from 'react';
import { View, StyleSheet, Text , Pressable } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useCameraWorklets } from '@features/camera-controls/lib/useCameraWorklets';
import { ParameterControl } from '@features/camera-controls/ui/footer/components/ParameterControl';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface ChromaButtonProps {
  label: string;
  grainChroma: SharedValue<number>;
  targetValue: number;
  onPress: () => void;
}

const ChromaButton = ({ label, grainChroma, targetValue, onPress }: ChromaButtonProps) => {
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);

  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = grainChroma.value === targetValue;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isSelected = grainChroma.value === targetValue;
    return {
      color: isSelected ? '#FFF' : '#888',
    };
  });

  return (
    <Pressable
      
      onPress={onPress}
      style={styles.pressable}
      containerStyle={styles.pressable}
    >
      <Animated.View style={[
        styles.pillButton,
        animatedStyle,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}>
        <Animated.Text style={[
          styles.pillText,
          animatedTextStyle
        ]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};


export const GrainExtension = () => {
  const { t } = useTranslation();
  const isDebugEnabled = useUIStore((s) => s.isDebugEnabled);
  const { grainChroma, setGrainChroma, grainSize, setGrainSize } = useStylesStore(
    useShallow(state => ({
      grainChroma: state.grainChroma,
      setGrainChroma: state.setGrainChroma,
      grainSize: state.grainSize,
      setGrainSize: state.setGrainSize,
    }))
  );

  const worklets = useCameraWorklets();

  return (
    <View style={styles.container}>
      <View style={[
        styles.chromaContainer,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}>
        <Text allowFontScaling={false} style={styles.label}>
          {t('parameters.chroma').toUpperCase()}
        </Text>
        <View style={styles.buttonRow}>
          <ChromaButton
            label="MONO"
            grainChroma={grainChroma}
            targetValue={0}
            onPress={() => {
              setGrainChroma(0);
              worklets.updateGrainChroma(0);
            }}
          />
          <ChromaButton
            label="RGB"
            grainChroma={grainChroma}
            targetValue={1}
            onPress={() => {
              setGrainChroma(1);
              worklets.updateGrainChroma(1);
            }}
          />
        </View>
      </View>
      <View style={styles.sizeContainer}>
        <ParameterControl
          label={t('parameters.size')}
          isActive={true}
          onPress={() => {}}
          value={grainSize}
          minValue={1.0}
          maxValue={4.0}
          onChange={setGrainSize}
          onUpdateWorklet={worklets.updateGrainSize}
          variant="slider"
          hideAutoPlaceholder={true}
          valueFormatter={(v) => {
            'worklet';
            return `${v.toFixed(1)}x`;
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  chromaContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeContainer: {
    flex: 1,
  },
  label: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  pressable: {
    width: 60,
  },
  pillButton: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

