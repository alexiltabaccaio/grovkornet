import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { ParameterPanelWrapper } from './ParameterPanelWrapper';
import { useSystemStore } from '../../model/useSystemStore';
import { PillButton } from '@shared/ui';

interface GenericPillPanelProps<T> {
  options: T[];
  onChange: (option: T, index: number) => void;
  value?: SharedValue<number> | null;
  isActiveShared?: (currValue: number, option: T, index: number) => boolean;
  isActiveStatic?: (option: T, index: number) => boolean;
  getLabel: (option: T, index: number) => string;
  animatedStyle?: StyleProp<ViewStyle>;
  pillMaxWidth?: number;
  gap?: number;
  paddingHorizontal?: number;
  children?: React.ReactNode;
  opacity?: number | SharedValue<number> | ((option: T, index: number) => number | SharedValue<number>);
  scrollable?: boolean;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

function GenericPillItemShared<T>({
  option,
  index,
  value,
  isActiveOption,
  getLabel,
  onChange,
  pillMaxWidth,
  isLayoutOverlayEnabled,
  opacity,
  scrollable,
}: {
  option: T;
  index: number;
  value: SharedValue<number>;
  isActiveOption: (currValue: number, option: T, index: number) => boolean;
  getLabel: (option: T, index: number) => string;
  onChange: (option: T, index: number) => void;
  pillMaxWidth: number;
  isLayoutOverlayEnabled: boolean;
  opacity: number | SharedValue<number> | ((option: T, index: number) => number | SharedValue<number>);
  scrollable: boolean;
}) {
  const isActive = useDerivedValue(() => isActiveOption(value.value, option, index));
  const itemOpacity = typeof opacity === 'function' ? opacity(option, index) : opacity;

  return (
    <PillButton
      label={getLabel(option, index)}
      isActive={isActive}
      onPress={() => onChange(option, index)}
      isLayoutOverlayEnabled={isLayoutOverlayEnabled}
      opacity={itemOpacity}
      style={[
        scrollable ? styles.pressableScrollable : styles.pressable,
        { maxWidth: pillMaxWidth }
      ]}
    />
  );
}

function GenericPillItemStatic<T>({
  option,
  index,
  isActiveOption,
  getLabel,
  onChange,
  pillMaxWidth,
  isLayoutOverlayEnabled,
  opacity,
  scrollable,
}: {
  option: T;
  index: number;
  isActiveOption: (option: T, index: number) => boolean;
  getLabel: (option: T, index: number) => string;
  onChange: (option: T, index: number) => void;
  pillMaxWidth: number;
  isLayoutOverlayEnabled: boolean;
  opacity: number | SharedValue<number> | ((option: T, index: number) => number | SharedValue<number>);
  scrollable: boolean;
}) {
  const isActive = isActiveOption(option, index);
  const itemOpacity = typeof opacity === 'function' ? opacity(option, index) : opacity;

  return (
    <PillButton
      label={getLabel(option, index)}
      isActive={isActive}
      onPress={() => onChange(option, index)}
      isLayoutOverlayEnabled={isLayoutOverlayEnabled}
      opacity={itemOpacity}
      style={[
        scrollable ? styles.pressableScrollable : styles.pressable,
        { maxWidth: pillMaxWidth }
      ]}
    />
  );
}

export function GenericPillPanel<T>({
  options,
  onChange,
  value,
  isActiveShared,
  isActiveStatic,
  getLabel,
  animatedStyle,
  pillMaxWidth = 80,
  gap = 8,
  paddingHorizontal = 16,
  children,
  opacity = 1,
  scrollable = false,
  leftAccessory,
  rightAccessory,
}: GenericPillPanelProps<T>) {
  const isLayoutOverlayEnabled = useSystemStore((s) => s.isLayoutOverlayEnabled);

  return (
    <ParameterPanelWrapper
      animatedStyle={animatedStyle}
      gap={gap}
      paddingHorizontal={paddingHorizontal}
      scrollable={scrollable}
      leftAccessory={leftAccessory}
      rightAccessory={rightAccessory}
    >
      {children}
      {options.map((option, index) => {
        if (value && isActiveShared) {
          return (
            <GenericPillItemShared
              key={index}
              option={option}
              index={index}
              value={value}
              isActiveOption={isActiveShared}
              getLabel={getLabel}
              onChange={onChange}
              pillMaxWidth={pillMaxWidth}
              isLayoutOverlayEnabled={isLayoutOverlayEnabled}
              opacity={opacity}
              scrollable={scrollable}
            />
          );
        }
        return (
          <GenericPillItemStatic
            key={index}
            option={option}
            index={index}
            isActiveOption={isActiveStatic || (() => false)}
            getLabel={getLabel}
            onChange={onChange}
            pillMaxWidth={pillMaxWidth}
            isLayoutOverlayEnabled={isLayoutOverlayEnabled}
            opacity={opacity}
            scrollable={scrollable}
          />
        );
      })}
    </ParameterPanelWrapper>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pressableScrollable: {
    minWidth: 70,
  },
});
