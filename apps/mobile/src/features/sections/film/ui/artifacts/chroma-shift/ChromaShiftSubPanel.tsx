import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton, ResettableLabel, SubPanelContainer } from '@shared/ui';
import { DEFAULT_CHROMA_SHIFT_DIRECTION } from '@grovkornet/shared';

interface ChromaShiftSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ChromaShiftSubPanel = ({ animatedStyle: _animatedStyle }: ChromaShiftSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore(
    (s) => s.isLayoutOverlayEnabled
  );
  
  const { chromaShiftDirection, setChromaShiftDirection, chromaShiftInvert, setChromaShiftInvert } = useFilmStore(
    useShallow((state) => ({
      chromaShiftDirection: state.chromaShiftDirection,
      setChromaShiftDirection: state.setChromaShiftDirection,
      chromaShiftInvert: state.chromaShiftInvert,
      setChromaShiftInvert: state.setChromaShiftInvert,
    }))
  );
  const worklets = useFilmWorklets();

  const handleDirectionPress = (val: number) => {
    setChromaShiftDirection(val);
    worklets.updateChromaShiftDirection(val);
  };

  const handleInvertPress = () => {
    const newVal = !chromaShiftInvert.value;
    setChromaShiftInvert(newVal);
    worklets.updateChromaShiftInvert(newVal);
  };

  const isHorActive = useDerivedValue(() => chromaShiftDirection.value === 0);
  const isVerActive = useDerivedValue(() => chromaShiftDirection.value === 1);
  const isInverted = useDerivedValue(() => chromaShiftInvert.value);

  return (
    <SubPanelContainer style={[styles.container, _animatedStyle]} showBorder={true} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <ResettableLabel
        label={t('parameters.direction').toUpperCase()}
        style={styles.label}
        onReset={() => {
          setChromaShiftDirection(DEFAULT_CHROMA_SHIFT_DIRECTION);
          worklets.updateChromaShiftDirection(DEFAULT_CHROMA_SHIFT_DIRECTION);
        }}
      />
      <View style={styles.buttonRow}>
        <PillButton
          label="HOR"
          isActive={isHorActive}
          onPress={() => handleDirectionPress(0)}
          isLayoutOverlayEnabled={isLayoutOverlayEnabled}
          style={styles.pressable}
        />
        <PillButton
          label="VER"
          isActive={isVerActive}
          onPress={() => handleDirectionPress(1)}
          isLayoutOverlayEnabled={isLayoutOverlayEnabled}
          style={styles.pressable}
        />
        <View style={styles.divider} />
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
