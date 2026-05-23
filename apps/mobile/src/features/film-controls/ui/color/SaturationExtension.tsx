import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { useFilmWorklets } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';

const COLOR_MAPPING = [
  {
    key: 'red',
    color: '#FF453A',
  },
  {
    key: 'orange',
    color: '#FF9F0A',
  },
  {
    key: 'yellow',
    color: '#FFD60A',
  },
  {
    key: 'green',
    color: '#32D74B',
  },
  {
    key: 'cyan',
    color: '#64D2FF',
  },
  {
    key: 'blue',
    color: '#0A84FF',
  },
  {
    key: 'purple',
    color: '#BF5AF2',
  },
  {
    key: 'magenta',
    color: '#FF2D55',
  },
] as const;

export const SaturationExtension = () => {
  const { t } = useTranslation();
  const [activeColorIndex, setActiveColorIndex] = React.useState<number>(0);

  const {
    satRed, setSatRed,
    satOrange, setSatOrange,
    satYellow, setSatYellow,
    satGreen, setSatGreen,
    satCyan, setSatCyan,
    satBlue, setSatBlue,
    satPurple, setSatPurple,
    satMagenta, setSatMagenta,
  } = useFilmStore(
    useShallow(state => ({
      satRed: state.satRed,
      setSatRed: state.setSatRed,
      satOrange: state.satOrange,
      setSatOrange: state.setSatOrange,
      satYellow: state.satYellow,
      setSatYellow: state.setSatYellow,
      satGreen: state.satGreen,
      setSatGreen: state.setSatGreen,
      satCyan: state.satCyan,
      setSatCyan: state.setSatCyan,
      satBlue: state.satBlue,
      setSatBlue: state.setSatBlue,
      satPurple: state.satPurple,
      setSatPurple: state.setSatPurple,
      satMagenta: state.satMagenta,
      setSatMagenta: state.setSatMagenta,
    }))
  );

  const worklets = useFilmWorklets();

  const activeColor = COLOR_MAPPING[activeColorIndex];

  const activeValue = useMemo(() => {
    switch (activeColorIndex) {
      case 0: return satRed;
      case 1: return satOrange;
      case 2: return satYellow;
      case 3: return satGreen;
      case 4: return satCyan;
      case 5: return satBlue;
      case 6: return satPurple;
      case 7: return satMagenta;
      default: return satRed;
    }
  }, [activeColorIndex, satRed, satOrange, satYellow, satGreen, satCyan, satBlue, satPurple, satMagenta]);

  const activeSetter = useMemo(() => {
    switch (activeColorIndex) {
      case 0: return setSatRed;
      case 1: return setSatOrange;
      case 2: return setSatYellow;
      case 3: return setSatGreen;
      case 4: return setSatCyan;
      case 5: return setSatBlue;
      case 6: return setSatPurple;
      case 7: return setSatMagenta;
      default: return setSatRed;
    }
  }, [activeColorIndex, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const activeWorklet = useMemo(() => {
    switch (activeColorIndex) {
      case 0: return worklets.updateSatRed;
      case 1: return worklets.updateSatOrange;
      case 2: return worklets.updateSatYellow;
      case 3: return worklets.updateSatGreen;
      case 4: return worklets.updateSatCyan;
      case 5: return worklets.updateSatBlue;
      case 6: return worklets.updateSatPurple;
      case 7: return worklets.updateSatMagenta;
      default: return worklets.updateSatRed;
    }
  }, [activeColorIndex, worklets]);

  return (
    <View style={styles.container}>
      <View style={styles.colorCirclesRow}>
        {COLOR_MAPPING.map((item, index) => {
          const isActive = index === activeColorIndex;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setActiveColorIndex(index)}
              style={[
                styles.circleContainer,
                isActive && styles.circleContainerActive
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.circle, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          );
        })}
      </View>
      <Text allowFontScaling={false} style={styles.activeColorLabel}>
        {t(`colors.${activeColor.key}`).toUpperCase()}
      </Text>
      <View style={styles.sliderContainer}>
        <ParameterControl
          label=""
          isActive={true}
          onPress={() => {}}
          value={activeValue}
          minValue={0.0}
          maxValue={100.0}
          onChange={activeSetter}
          onUpdateWorklet={activeWorklet}
          variant="slider"
          hideAutoPlaceholder={true}
          valueFormatter={(v) => {
            'worklet';
            return `${v.toFixed(0)}%`;
          }}
        />
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
    paddingHorizontal: 16,
  },
  colorCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  circleContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainerActive: {
    borderColor: '#FFFFFF',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  activeColorLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  sliderContainer: {
    width: '100%',
  },
});
