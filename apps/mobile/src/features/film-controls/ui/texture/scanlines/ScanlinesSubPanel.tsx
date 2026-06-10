import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/shallow';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@entities/system';
import { PillButton, ResettableLabel, SubPanelContainer } from '@shared/ui';
import { 
  DEFAULT_SCANLINES_MODE, 
  DEFAULT_SCANLINES_DENSITY,
} from '@grovkornet/shared';

const formatDensityValue = (v: number) => {
  'worklet';
  return `${Math.round(v)}`;
};

const noop = () => {};

interface ScanlinesSubPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const ScanlinesSubPanel = React.memo(({ animatedStyle: _animatedStyle }: ScanlinesSubPanelProps) => {
  const { t } = useTranslation();
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);
  const { 
    scanlinesMode, setScanlinesMode, 
    scanlinesDensity, setScanlinesDensity,
  } = useFilmStore(
    useShallow(state => ({
      scanlinesMode: state.scanlinesMode,
      setScanlinesMode: state.setScanlinesMode,
      scanlinesDensity: state.scanlinesDensity,
      setScanlinesDensity: state.setScanlinesDensity,
    }))
  );

  const worklets = useFilmWorklets();

  const isHorActive = useDerivedValue(() => scanlinesMode.value === 0);
  const isVerActive = useDerivedValue(() => scanlinesMode.value === 1);

  return (
    <SubPanelContainer style={[styles.container, _animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <View style={styles.row}>
        <View style={[
          styles.directionContainer,
          isLayoutOverlayEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
        ]}>
          <ResettableLabel
            label={t('parameters.direction').toUpperCase()}
            style={styles.label}
            onReset={() => {
              setScanlinesMode(DEFAULT_SCANLINES_MODE);
              worklets.updateScanlinesMode(DEFAULT_SCANLINES_MODE);
            }}
          />
          <View style={styles.buttonRow}>
            <PillButton
              label="HOR"
              isActive={isHorActive}
              onPress={() => {
                setScanlinesMode(0);
                worklets.updateScanlinesMode(0);
              }}
              isLayoutOverlayEnabled={isLayoutOverlayEnabled}
              style={styles.pressable}
            />
            <PillButton
              label="VER"
              isActive={isVerActive}
              onPress={() => {
                setScanlinesMode(1);
                worklets.updateScanlinesMode(1);
              }}
              isLayoutOverlayEnabled={isLayoutOverlayEnabled}
              style={styles.pressable}
            />
          </View>
        </View>
        <View style={styles.densityContainer}>
          <ParameterControl
            label={t('parameters.density')}
            isActive={true}
            onPress={noop}
            value={scanlinesDensity}
            minValue={200.0}
            maxValue={1600.0}
            onChange={setScanlinesDensity}
            onUpdateWorklet={worklets.updateScanlinesDensity}
            variant="slider"
            hideAutoPlaceholder={true}
            valueFormatter={formatDensityValue}
            onReset={() => {
              setScanlinesDensity(DEFAULT_SCANLINES_DENSITY);
              worklets.updateScanlinesDensity(DEFAULT_SCANLINES_DENSITY);
            }}
          />
        </View>
      </View>
    </SubPanelContainer>
  );
});

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
  directionContainer: {
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
  densityContainer: {
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
});
