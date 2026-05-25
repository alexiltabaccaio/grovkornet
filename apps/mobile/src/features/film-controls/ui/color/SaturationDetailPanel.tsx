import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets, useFilmParameterControlData } from '@entities/film';
import { ParameterControl } from '@entities/system';
import { useTranslation } from 'react-i18next';
import { ColorRangeSlider } from './ColorRangeSlider';

const COLOR_MAPPING = [
  { key: 'red', color: '#FF453A' },
  { key: 'orange', color: '#FF9F0A' },
  { key: 'yellow', color: '#FFD60A' },
  { key: 'green', color: '#32D74B' },
  { key: 'cyan', color: '#64D2FF' },
  { key: 'blue', color: '#0A84FF' },
  { key: 'purple', color: '#BF5AF2' },
  { key: 'magenta', color: '#FF2D55' },
] as const;

type ColorIndex = 'master' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SaturationDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: any;
  animatedStyle?: any;
}

export const SaturationDetailPanel = ({
  parameterDetailPanelAnimatedStyle,
  animatedStyle
}: SaturationDetailPanelProps) => {
  const { t } = useTranslation();
  const [activeColorIndex, setActiveColorIndex] = React.useState<ColorIndex>('master');

  const masterData = useFilmParameterControlData('saturation');

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

  const isMaster = activeColorIndex === 'master';

  const activeValue = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.value;
    switch (activeColorIndex) {
      case 0: return satRed;
      case 1: return satOrange;
      case 2: return satYellow;
      case 3: return satGreen;
      case 4: return satCyan;
      case 5: return satBlue;
      case 6: return satPurple;
      case 7: return satMagenta;
    }
  }, [activeColorIndex, masterData.value, satRed, satOrange, satYellow, satGreen, satCyan, satBlue, satPurple, satMagenta]);

  const activeSetter = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.onChange;
    switch (activeColorIndex) {
      case 0: return setSatRed;
      case 1: return setSatOrange;
      case 2: return setSatYellow;
      case 3: return setSatGreen;
      case 4: return setSatCyan;
      case 5: return setSatBlue;
      case 6: return setSatPurple;
      case 7: return setSatMagenta;
    }
  }, [activeColorIndex, masterData.onChange, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const activeWorklet = useMemo(() => {
    if (activeColorIndex === 'master') return masterData.onUpdateWorklet;
    switch (activeColorIndex) {
      case 0: return worklets.updateSatRed;
      case 1: return worklets.updateSatOrange;
      case 2: return worklets.updateSatYellow;
      case 3: return worklets.updateSatGreen;
      case 4: return worklets.updateSatCyan;
      case 5: return worklets.updateSatBlue;
      case 6: return worklets.updateSatPurple;
      case 7: return worklets.updateSatMagenta;
    }
  }, [activeColorIndex, masterData.onUpdateWorklet, worklets]);

  const renderMultiColorDot = () => {
    const isActive = isMaster;
    return (
      <View style={styles.multiColorDotAbsolute}>
        <TouchableOpacity
          testID="color-circle-master"
          onPress={() => setActiveColorIndex('master')}
          style={[
            styles.circleContainer,
            isActive && styles.circleContainerActive,
          ]}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.multiColorCircle}>
            <View style={{ width: 10, height: 10, backgroundColor: '#FF453A' }} />
            <View style={{ width: 10, height: 10, backgroundColor: '#FFD60A' }} />
            <View style={{ width: 10, height: 10, backgroundColor: '#0A84FF' }} />
            <View style={{ width: 10, height: 10, backgroundColor: '#32D74B' }} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.sliderRow, parameterDetailPanelAnimatedStyle]}>
        <View style={styles.sliderContainer}>
          <ParameterControl
            label=""
            isActive={true}
            onPress={() => {}}
            value={activeValue}
            minValue={isMaster ? masterData.minValue : 0.0}
            maxValue={isMaster ? masterData.maxValue : 100.0}
            centerValue={isMaster ? masterData.centerValue : 50.0}
            onChange={activeSetter as any}
            onUpdateWorklet={activeWorklet as any}
            variant="slider"
            onReset={isMaster ? masterData.onReset : undefined}
            valueFormatter={isMaster ? masterData.valueFormatter : (v) => {
              'worklet';
              return `${Math.round(v * 2)}`;
            }}
          />
        </View>
        {renderMultiColorDot()}
      </Animated.View>

      <Animated.View style={[styles.colorCirclesRow, animatedStyle]}>
        {COLOR_MAPPING.map((item, index) => {
          const isActive = index === activeColorIndex;
          return (
            <TouchableOpacity
              key={item.key}
              testID={`color-circle-${item.key}`}
              onPress={() => setActiveColorIndex(index as ColorIndex)}
              style={[
                styles.circleContainer,
                isActive && styles.circleContainerActive
              ]}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <View style={[styles.circle, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {!isMaster && (
        <ColorRangeSlider activeColorIndex={activeColorIndex as number} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
  },
  colorCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  circleContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  multiColorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sliderContainer: {
    flex: 1,
  },
  multiColorDotAbsolute: {
    position: 'absolute',
    left: 39,
    top: 9,
    zIndex: 10,
  },
});
