import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton, SubPanelContainer } from '@shared/ui';

interface ChromaticAberrationSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ChromaticAberrationSubPanel = ({ animatedStyle }: ChromaticAberrationSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);
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
    <SubPanelContainer style={[styles.container, animatedStyle]} showBorder={true} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <Text allowFontScaling={false} style={styles.label}>
        {t('parameters.direction').toUpperCase()}
      </Text>
      <View style={styles.buttonRow}>
        <PillButton
          label="INV"
          isActive={isInverted}
          onPress={handleInvertPress}
          isLayoutOverlayEnabled={isLayoutOverlayEnabled}
          style={styles.pressableInvert}
        />
      </View>
    </SubPanelContainer>
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
  pressableInvert: {
    width: 50,
  },
});
