import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';

export const GrainExtension = () => {
  const { t } = useTranslation();
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);
  const { grainChroma, setGrainChroma, grainSize, setGrainSize, grainSpeed, setGrainSpeed } = useFilmStore(
    useShallow(state => ({
      grainChroma: state.grainChroma,
      setGrainChroma: state.setGrainChroma,
      grainSize: state.grainSize,
      setGrainSize: state.setGrainSize,
      grainSpeed: state.grainSpeed,
      setGrainSpeed: state.setGrainSpeed,
    }))
  );

  const worklets = useFilmWorklets();

  const isMonoActive = useDerivedValue(() => grainChroma.value === 0);
  const isRgbActive = useDerivedValue(() => grainChroma.value === 1);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[
          styles.chromaContainer,
          isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
        ]}>
          <Text allowFontScaling={false} style={styles.label}>
            {t('parameters.chroma').toUpperCase()}
          </Text>
          <View style={styles.buttonRow}>
            <PillButton
              label="MONO"
              isActive={isMonoActive}
              onPress={() => {
                setGrainChroma(0);
                worklets.updateGrainChroma(0);
              }}
              isDebugEnabled={isDebugEnabled}
              style={styles.pressable}
            />
            <PillButton
              label="RGB"
              isActive={isRgbActive}
              onPress={() => {
                setGrainChroma(1);
                worklets.updateGrainChroma(1);
              }}
              isDebugEnabled={isDebugEnabled}
              style={styles.pressable}
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
      <View style={styles.row}>
        <View style={styles.placeholderContainer} />
        <View style={styles.speedContainer}>
          <ParameterControl
            label={t('parameters.speed')}
            isActive={true}
            onPress={() => {}}
            value={grainSpeed}
            minValue={0.0}
            maxValue={30.0}
            onChange={setGrainSpeed}
            onUpdateWorklet={worklets.updateGrainSpeed}
            variant="slider"
            hideAutoPlaceholder={true}
            valueFormatter={(v) => {
              'worklet';
              return `${v.toFixed(1)}x`;
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  chromaContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeContainer: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
  },
  speedContainer: {
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
    width: 75,
  },
});

