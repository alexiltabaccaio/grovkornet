import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useTranslation } from 'react-i18next';

interface DirectionButtonProps {
  label: string;
  value: number;
  activeDirection: Animated.SharedValue<number>;
  onPress: (val: number) => void;
}

const DirectionButton = ({ label, value, activeDirection, onPress }: DirectionButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = activeDirection.value === value;
    return {
      borderColor: isSelected ? '#FFF' : '#333',
      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const isSelected = activeDirection.value === value;
    return {
      color: isSelected ? '#FFF' : '#888',
    };
  });

  return (
    <Pressable
      onPress={() => onPress(value)}
      style={styles.pressable}
    >
      <Animated.View style={[styles.pillButton, animatedStyle]}>
        <Animated.Text style={[styles.pillText, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const ChromaticAberrationExtension = () => {
  const { t } = useTranslation();
  const { aberrationDirection, setAberrationDirection } = useStylesStore(
    useShallow((state) => ({
      aberrationDirection: state.aberrationDirection,
      setAberrationDirection: state.setAberrationDirection,
    }))
  );

  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.label}>
        {t('parameters.direction').toUpperCase()}
      </Text>
      <View style={styles.buttonRow}>
        <DirectionButton
          label="STD"
          value={0}
          activeDirection={aberrationDirection}
          onPress={setAberrationDirection}
        />
        <DirectionButton
          label="HOR"
          value={1}
          activeDirection={aberrationDirection}
          onPress={setAberrationDirection}
        />
        <DirectionButton
          label="RAD"
          value={2}
          activeDirection={aberrationDirection}
          onPress={setAberrationDirection}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
