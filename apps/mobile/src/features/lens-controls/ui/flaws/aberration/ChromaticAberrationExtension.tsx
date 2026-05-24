import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';

export const ChromaticAberrationExtension = () => {
  const { t } = useTranslation();
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);
  const { aberrationDirection, setAberrationDirection, aberrationInvert, setAberrationInvert } = useFilmStore(
    useShallow((state) => ({
      aberrationDirection: state.aberrationDirection,
      setAberrationDirection: state.setAberrationDirection,
      aberrationInvert: state.aberrationInvert,
      setAberrationInvert: state.setAberrationInvert,
    }))
  );
  const worklets = useFilmWorklets();

  const handlePress = (val: number) => {
    setAberrationDirection(val);
    worklets.updateAberrationDirection(val);
  };

  const handleInvertPress = () => {
    const newVal = !aberrationInvert.value;
    setAberrationInvert(newVal);
    worklets.updateAberrationInvert(newVal);
  };

  const isStdActive = useDerivedValue(() => aberrationDirection.value === 0);
  const isHorActive = useDerivedValue(() => aberrationDirection.value === 1);
  const isRadActive = useDerivedValue(() => aberrationDirection.value === 2);
  const isInverted = useDerivedValue(() => aberrationInvert.value);

  return (
    <View style={[
      styles.container,
      isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
    ]}>
      <Text allowFontScaling={false} style={styles.label}>
        {t('parameters.direction').toUpperCase()}
      </Text>
      <View style={styles.buttonRow}>
        <PillButton
          label="STD"
          isActive={isStdActive}
          onPress={() => handlePress(0)}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressable}
        />
        <PillButton
          label="HOR"
          isActive={isHorActive}
          onPress={() => handlePress(1)}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressable}
        />
        <PillButton
          label="RAD"
          isActive={isRadActive}
          onPress={() => handlePress(2)}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressable}
        />
        <View style={styles.divider} />
        <PillButton
          label="INV"
          isActive={isInverted}
          onPress={handleInvertPress}
          isDebugEnabled={isDebugEnabled}
          style={styles.pressableInvert}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'transparent',
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
  pressableInvert: {
    width: 50,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
});
