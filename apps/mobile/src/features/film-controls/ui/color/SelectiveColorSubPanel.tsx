import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ParameterControl, useSystemStore } from '@entities/system';
import { ColorRangeSlider } from './ColorRangeSlider';
import { ColorCircle } from './components/ColorCircle';
import { useSelectiveColor } from '../../lib/useSelectiveColor';
import { SubPanelContainer } from '@shared/ui';

const noop = () => {};

const formatSaturationColor = (v: number) => {
  'worklet';
  return `${Math.round(v * 2)}`;
};

const formatHueColor = (v: number) => {
  'worklet';
  const deg = Math.round(v);
  return deg > 0 ? `+${deg}°` : `${deg}°`;
};

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

interface SelectiveColorSubPanelProps {
  type: 'saturation' | 'hue';
  animatedStyle?: StyleProp<ViewStyle>;
}

export const SelectiveColorSubPanel = React.memo(({
  type,
  animatedStyle
}: SelectiveColorSubPanelProps) => {
  const isLayoutOverlayEnabled = useSystemStore(state => state.isLayoutOverlayEnabled);
  const {
    activeColorIndex,
    activeValue,
    activeSetter,
    activeWorklet,
    activeReset,
    handleColorPress,
  } = useSelectiveColor(type);

  const isSat = type === 'saturation';

  return (
    <SubPanelContainer style={[styles.container, animatedStyle]} isLayoutOverlayEnabled={isLayoutOverlayEnabled}>
      <View style={styles.colorCirclesRow}>
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
      </View>

      <View style={styles.sliderRow}>
        <View style={styles.sliderContainer}>
          <ParameterControl
            label=""
            isActive={true}
            onPress={noop}
            value={activeValue}
            minValue={isSat ? 0.0 : -180.0}
            maxValue={isSat ? 100.0 : 180.0}
            centerValue={isSat ? 50.0 : 0.0}
            onChange={activeSetter}
            onUpdateWorklet={activeWorklet}
            variant="slider"
            onReset={activeReset}
            valueFormatter={isSat ? formatSaturationColor : formatHueColor}
            sliderColor={COLOR_MAPPING[activeColorIndex].color}
            hideDebugRectangles={true}
          />
        </View>
      </View>

      <ColorRangeSlider activeColorIndex={activeColorIndex} />
    </SubPanelContainer>
  );
});

SelectiveColorSubPanel.displayName = 'SelectiveColorSubPanel';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  sliderRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 4,
  },
  colorCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 0,
    marginBottom: 4,
  },
  sliderContainer: {
    flex: 1,
  },
});
