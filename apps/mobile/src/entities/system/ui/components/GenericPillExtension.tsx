import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { ParameterExtensionWrapper } from './ParameterExtensionWrapper';
import { useSystemStore } from '../../model/useSystemStore';
import { PillButton } from '@shared/ui';

interface GenericPillExtensionProps<T> {
  options: T[];
  onChange: (option: T, index: number) => void;
  value?: SharedValue<number> | null;
  isActiveShared?: (currValue: number, option: T, index: number) => boolean;
  isActiveStatic?: (option: T, index: number) => boolean;
  getLabel: (option: T, index: number) => string;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
  pillMaxWidth?: number;
  gap?: number;
  paddingHorizontal?: number;
  children?: React.ReactNode;
  opacity?: number | SharedValue<number> | ((option: T, index: number) => number | SharedValue<number>);
}

function GenericPillItemShared<T>({
  option,
  index,
  value,
  isActiveOption,
  getLabel,
  onChange,
  pillMaxWidth,
  isDebugEnabled,
  opacity,
}: {
  option: T;
  index: number;
  value: SharedValue<number>;
  isActiveOption: (currValue: number, option: T, index: number) => boolean;
  getLabel: (option: T, index: number) => string;
  onChange: (option: T, index: number) => void;
  pillMaxWidth: number;
  isDebugEnabled: boolean;
  opacity: number | SharedValue<number> | ((option: T, index: number) => number | SharedValue<number>);
}) {
  const isActive = useDerivedValue(() => isActiveOption(value.value, option, index));
  const itemOpacity = typeof opacity === 'function' ? opacity(option, index) : opacity;

  return (
    <PillButton
      label={getLabel(option, index)}
      isActive={isActive}
      onPress={() => onChange(option, index)}
      isDebugEnabled={isDebugEnabled}
      opacity={itemOpacity}
      style={[styles.pressable, { maxWidth: pillMaxWidth }]}
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
  isDebugEnabled,
  opacity,
}: {
  option: T;
  index: number;
  isActiveOption: (option: T, index: number) => boolean;
  getLabel: (option: T, index: number) => string;
  onChange: (option: T, index: number) => void;
  pillMaxWidth: number;
  isDebugEnabled: boolean;
  opacity: number | SharedValue<number> | ((option: T, index: number) => number | SharedValue<number>);
}) {
  const isActive = isActiveOption(option, index);
  const itemOpacity = typeof opacity === 'function' ? opacity(option, index) : opacity;

  return (
    <PillButton
      label={getLabel(option, index)}
      isActive={isActive}
      onPress={() => onChange(option, index)}
      isDebugEnabled={isDebugEnabled}
      opacity={itemOpacity}
      style={[styles.pressable, { maxWidth: pillMaxWidth }]}
    />
  );
}

export function GenericPillExtension<T>({
  options,
  onChange,
  value,
  isActiveShared,
  isActiveStatic,
  getLabel,
  parameterExtensionAnimatedStyle,
  pillMaxWidth = 80,
  gap = 8,
  paddingHorizontal = 16,
  children,
  opacity = 1,
}: GenericPillExtensionProps<T>) {
  const isDebugEnabled = useSystemStore((s) => s.isDebugEnabled);

  return (
    <ParameterExtensionWrapper
      animatedStyle={parameterExtensionAnimatedStyle}
      gap={gap}
      paddingHorizontal={paddingHorizontal}
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
              isDebugEnabled={isDebugEnabled}
              opacity={opacity}
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
            isDebugEnabled={isDebugEnabled}
            opacity={opacity}
          />
        );
      })}
    </ParameterExtensionWrapper>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
});
export default GenericPillExtension;
