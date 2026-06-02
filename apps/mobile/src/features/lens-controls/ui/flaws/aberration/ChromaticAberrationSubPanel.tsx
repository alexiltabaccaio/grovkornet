import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';

interface ChromaticAberrationSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ChromaticAberrationSubPanel = ({ animatedStyle }: ChromaticAberrationSubPanelProps) => {
  const { t } = useTranslation();
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);
  const { aberrationInvert, setAberrationInvert } = useFilmStore(
    useShallow((state) => ({
      aberrationInvert: state.aberrationInvert,
      setAberrationInvert: state.setAberrationInvert,
    }))
  );
  const worklets = useFilmWorklets();

  const handleInvertPress = () => {
    const newVal = !aberrationInvert.value;
    setAberrationInvert(newVal);
    worklets.updateAberrationInvert(newVal);
  };

  const isInverted = useDerivedValue(() => aberrationInvert.value);

  return (
    <View style={[
      styles.container,
      isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green', paddingTop: 6, margin: -1.5 }
    ]}>
      <Text allowFontScaling={false} style={styles.label}>
        {t('parameters.direction').toUpperCase()}
      </Text>
      <View style={styles.buttonRow}>
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
  pressableInvert: {
    width: 50,
  },
});
