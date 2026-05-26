import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ParameterControl } from '@entities/system';
import { ColorRangeSlider } from './ColorRangeSlider';
import { ColorCircle } from './components/ColorCircle';
import { useSelectiveSaturation } from '../../lib/useSelectiveSaturation';

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

interface SaturationDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

export const SaturationDetailPanel = ({
  parameterDetailPanelAnimatedStyle,
  animatedStyle
}: SaturationDetailPanelProps) => {
  const {
    activeColorIndex,
    setActiveColorIndex,
    isMaster,
    activeValue,
    activeSetter,
    activeWorklet,
    masterData,
    handleColorPress,
    handlePressWithDouble,
  } = useSelectiveSaturation();

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
          <ColorCircle
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
