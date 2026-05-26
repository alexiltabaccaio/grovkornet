import React, { useMemo, useCallback, memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore, useFilmWorklets, useFilmParameterControlData } from '@entities/film';
import { DEFAULT_SELECTIVE_SATURATION } from '@grovkornet/shared';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { ParameterControl, useSystemStore } from '@entities/system';
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

interface ColorCircleProps {
  itemKey: string;
  index: number;
  isActive: boolean;
  color: string;
  onPress: (key: string, index: number) => void;
}

const MemoizedColorCircle = memo(({ itemKey, index, isActive, color, onPress }: ColorCircleProps) => {
  const handlePress = useCallback(() => {
    onPress(itemKey, index);
  }, [itemKey, index, onPress]);

  return (
    <TouchableOpacity
      testID={`color-circle-${itemKey}`}
      onPress={handlePress}
      style={[styles.circleContainer, isActive && styles.circleContainerActive]}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
    >
      <View style={[styles.circle, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
});
MemoizedColorCircle.displayName = 'MemoizedColorCircle';

type ColorIndex = 'master' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SaturationDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

export const SaturationDetailPanel = ({
  parameterDetailPanelAnimatedStyle,
  animatedStyle
}: SaturationDetailPanelProps) => {
  const [activeColorIndex, setActiveColorIndex] = React.useState<ColorIndex>('master');
  const activeParameter = useSystemStore(useShallow(state => state.activeParameter));
  const [prevActiveParameter, setPrevActiveParameter] = React.useState(activeParameter);

  if (activeParameter !== prevActiveParameter) {
    setPrevActiveParameter(activeParameter);
    if (activeParameter === 'saturation') {
      setActiveColorIndex('master');
    }
  }

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

  const handleColorReset = useCallback((colorKey: string) => {
    if (colorKey === 'master') {
      masterData.onReset();
    } else {
      const v = DEFAULT_SELECTIVE_SATURATION;
      switch (colorKey) {
        case 'red':     setSatRed(v); break;
        case 'orange':  setSatOrange(v); break;
        case 'yellow':  setSatYellow(v); break;
        case 'green':   setSatGreen(v); break;
        case 'cyan':    setSatCyan(v); break;
        case 'blue':    setSatBlue(v); break;
        case 'purple':  setSatPurple(v); break;
        case 'magenta': setSatMagenta(v); break;
      }
    }
  }, [masterData, setSatRed, setSatOrange, setSatYellow, setSatGreen, setSatCyan, setSatBlue, setSatPurple, setSatMagenta]);

  const { handlePressWithDouble } = useDoublePress(handleColorReset);

  const handleColorPress = useCallback((key: string, index: number) => {
    handlePressWithDouble(key, () => setActiveColorIndex(index as ColorIndex));
  }, [handlePressWithDouble]);

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
          onPress={() => handlePressWithDouble('master', () => setActiveColorIndex('master'))}
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
            onChange={activeSetter}
            onUpdateWorklet={activeWorklet}
            variant="slider"
            onReset={isMaster ? masterData.onReset : undefined}
            valueFormatter={isMaster ? masterData.valueFormatter : (v) => {
              'worklet';
              return `${Math.round(v * 2)}`;
            }}
            sliderColor={isMaster ? undefined : COLOR_MAPPING[activeColorIndex as number].color}
          />
        </View>
        {renderMultiColorDot()}
      </Animated.View>

      <Animated.View style={[styles.colorCirclesRow, animatedStyle]}>
        {COLOR_MAPPING.map((item, index) => (
          <MemoizedColorCircle
            key={item.key}
            itemKey={item.key}
            index={index}
            isActive={index === activeColorIndex}
            color={item.color}
            onPress={handleColorPress}
          />
        ))}
      </Animated.View>

      {!isMaster && (
        <ColorRangeSlider activeColorIndex={activeColorIndex} />
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
