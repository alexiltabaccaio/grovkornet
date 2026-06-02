import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton, ResettableLabel, SubPanelContainer } from '@shared/ui';
import { 
  DEFAULT_GRAIN_SIZE, 
  DEFAULT_GRAIN_SPEED, 
  DEFAULT_GRAIN_ROUGHNESS,
  DEFAULT_GRAIN_CHROMA,
} from '@grovkornet/shared';

const formatGrainValue = (v: number) => {
  'worklet';
  return `${v.toFixed(1)}x`;
};

const formatRoughnessValue = (v: number) => {
  'worklet';
  return `${Math.round(v * 100)}`;
};

const noop = () => {};

interface GrainSubPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

export const GrainSubPanel = ({ parameterDetailPanelAnimatedStyle: _parameterDetailPanelAnimatedStyle, animatedStyle: _animatedStyle }: GrainSubPanelProps) => {
  const { t } = useTranslation();
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);
  const { 
    grainChroma, setGrainChroma, 
    grainSize, setGrainSize, 
    grainSpeed, setGrainSpeed,
    grainRoughness, setGrainRoughness
  } = useFilmStore(
    useShallow(state => ({
      grainChroma: state.grainChroma,
      setGrainChroma: state.setGrainChroma,
      grainSize: state.grainSize,
      setGrainSize: state.setGrainSize,
      grainSpeed: state.grainSpeed,
      setGrainSpeed: state.setGrainSpeed,
      grainRoughness: state.grainRoughness,
      setGrainRoughness: state.setGrainRoughness,
    }))
  );

  const worklets = useFilmWorklets();

  const isMonoActive = useDerivedValue(() => grainChroma.value === 0);
  const isRgbActive = useDerivedValue(() => grainChroma.value === 1);

  return (
    <SubPanelContainer style={[styles.container, _animatedStyle]}>
      <View style={styles.row}>
          <View style={[
            styles.chromaContainer,
            isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
          ]}>
            <ResettableLabel
              label={t('parameters.chroma').toUpperCase()}
              style={styles.label}
              onReset={() => {
                setGrainChroma(DEFAULT_GRAIN_CHROMA);
                worklets.updateGrainChroma(DEFAULT_GRAIN_CHROMA);
              }}
            />
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
            onPress={noop}
            value={grainSize}
            minValue={1.0}
            maxValue={4.0}
            onChange={setGrainSize}
            onUpdateWorklet={worklets.updateGrainSize}
            variant="slider"
            hideAutoPlaceholder={true}
            valueFormatter={formatGrainValue}
            onReset={() => {
              setGrainSize(DEFAULT_GRAIN_SIZE);
              worklets.updateGrainSize(DEFAULT_GRAIN_SIZE);
            }}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.roughnessContainer}>
          <ParameterControl
            label={t('parameters.roughness')}
            isActive={true}
            onPress={noop}
            value={grainRoughness}
            minValue={0.0}
            maxValue={1.0}
            onChange={setGrainRoughness}
            onUpdateWorklet={worklets.updateGrainRoughness}
            variant="slider"
            hideAutoPlaceholder={true}
            valueFormatter={formatRoughnessValue}
            onReset={() => {
              setGrainRoughness(DEFAULT_GRAIN_ROUGHNESS);
              worklets.updateGrainRoughness(DEFAULT_GRAIN_ROUGHNESS);
            }}
          />
        </View>
        <View style={styles.speedContainer}>
          <ParameterControl
            label={t('parameters.speed')}
            isActive={true}
            onPress={noop}
            value={grainSpeed}
            minValue={0.0}
            maxValue={30.0}
            onChange={setGrainSpeed}
            onUpdateWorklet={worklets.updateGrainSpeed}
            variant="slider"
            hideAutoPlaceholder={true}
            valueFormatter={formatGrainValue}
            onReset={() => {
              setGrainSpeed(DEFAULT_GRAIN_SPEED);
              worklets.updateGrainSpeed(DEFAULT_GRAIN_SPEED);
            }}
          />
        </View>
      </View>
    </SubPanelContainer>
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
  roughnessContainer: {
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

