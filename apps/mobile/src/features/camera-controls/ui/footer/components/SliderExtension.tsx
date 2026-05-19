import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterControl } from './ParameterControl';
import { ParameterType } from '@shared/types/camera';

interface SliderExtensionProps {
  parameter: ParameterType;
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
  isActiveOverride?: boolean;
}

export const SliderExtension = ({
  parameter,
  parameterExtensionAnimatedStyle,
  isActiveOverride,
}: SliderExtensionProps) => {
  // Styles store fields
  const stylesState = useStylesStore(
    useShallow((s) => ({
      grainIntensity: s.grainIntensity,
      setGrainIntensity: s.setGrainIntensity,
      sharpening: s.sharpening,
      setSharpening: s.setSharpening,
      saturation: s.saturation,
      setSaturation: s.setSaturation,
      contrast: s.contrast,
      setContrast: s.setContrast,
      chromaticAberration: s.chromaticAberration,
      setChromaticAberration: s.setChromaticAberration,
    }))
  );

  // Hardware store fields
  const hw = useHardwareStore(
    useShallow((s) => ({
      temperature: s.temperature,
      setTemperature: s.setTemperature,
      temperatureAuto: s.temperatureAuto,
      setTemperatureAuto: s.setTemperatureAuto,
      tint: s.tint,
      setTint: s.setTint,
      ev: s.ev,
      setEv: s.setEv,
      iso: s.iso,
      setIso: s.setIso,
      isoAuto: s.isoAuto,
      setIsoAuto: s.setIsoAuto,
      shutterSpeed: s.shutterSpeed,
      setShutterSpeed: s.setShutterSpeed,
      shutterSpeedAuto: s.shutterSpeedAuto,
      setShutterSpeedAuto: s.setShutterSpeedAuto,
      focusDistance: s.focusDistance,
      setFocusDistance: s.setFocusDistance,
      focusAuto: s.focusAuto,
      setFocusAuto: s.setFocusAuto,
      capabilities: s.capabilities,
    }))
  );

  const { activeExtension } = useUIStore(
    useShallow((s) => ({
      activeExtension: s.activeExtension,
    }))
  );

  const isEvDisabled = useDerivedValue(() => {
    return !hw.isoAuto.value && !hw.shutterSpeedAuto.value;
  });

  let value = stylesState.grainIntensity;
  let minValue = 0;
  let maxValue = 1;
  let centerValue: number | undefined = undefined;
  let onChange = stylesState.setGrainIntensity;
  let isAuto = undefined;
  let valueFormatter = (v: number) => {
    'worklet';
    return `${Math.round(v * 100)}`;
  };
  let hideValueInAuto = false;
  let autoValueText = 'AUTO';
  let onReset = () => stylesState.setGrainIntensity(0);
  let onToggleAuto = undefined;
  let disabled = undefined;

  switch (parameter) {
    case 'grain':
      value = stylesState.grainIntensity;
      minValue = 0;
      maxValue = 1.0;
      onChange = stylesState.setGrainIntensity;
      valueFormatter = (v: number) => {
        'worklet';
        return `${Math.round(v * 100)}`;
      };
      onReset = () => stylesState.setGrainIntensity(0);
      break;
    case 'sharpening':
      value = stylesState.sharpening;
      minValue = 0;
      maxValue = 1.0;
      onChange = stylesState.setSharpening;
      valueFormatter = (v: number) => {
        'worklet';
        return `${Math.round(v * 100)}`;
      };
      onReset = () => stylesState.setSharpening(0);
      break;
    case 'saturation':
      value = stylesState.saturation;
      minValue = 0;
      maxValue = 2.0;
      centerValue = 1.0;
      onChange = stylesState.setSaturation;
      valueFormatter = (v: number) => {
        'worklet';
        const val = Math.round((v - 1) * 100);
        return val > 0 ? `+${val}` : `${val}`;
      };
      onReset = () => stylesState.setSaturation(1.0);
      break;
    case 'contrast':
      value = stylesState.contrast;
      minValue = 0;
      maxValue = 2.0;
      centerValue = 1.0;
      onChange = stylesState.setContrast;
      valueFormatter = (v: number) => {
        'worklet';
        const val = Math.round((v - 1) * 100);
        return val > 0 ? `+${val}` : `${val}`;
      };
      onReset = () => stylesState.setContrast(1.0);
      break;
    case 'chromatic_aberration':
      value = stylesState.chromaticAberration;
      minValue = 0.0;
      maxValue = 2.0;
      onChange = stylesState.setChromaticAberration;
      valueFormatter = (v: number) => {
        'worklet';
        return `${Math.round(v * 100)}`;
      };
      onReset = () => stylesState.setChromaticAberration(0.0);
      break;
    case 'temperature':
      value = hw.temperature;
      minValue = 2000;
      maxValue = 10000;
      onChange = hw.setTemperature;
      isAuto = hw.temperatureAuto;
      valueFormatter = (v: number) => {
        'worklet';
        return `${Math.round(v)}K`;
      };
      hideValueInAuto = true;
      autoValueText = 'AWB';
      onReset = () => hw.setTemperatureAuto(true);
      onToggleAuto = hw.setTemperatureAuto;
      break;
    case 'tint':
      value = hw.tint;
      minValue = -100;
      maxValue = 100;
      centerValue = 0;
      onChange = hw.setTint;
      isAuto = hw.temperatureAuto;
      valueFormatter = (v: number) => {
        'worklet';
        const rounded = Math.round(v);
        return rounded > 0 ? `+${rounded}` : `${rounded}`;
      };
      hideValueInAuto = true;
      autoValueText = 'AWB';
      onReset = () => hw.setTemperatureAuto(true);
      onToggleAuto = hw.setTemperatureAuto;
      break;
    case 'ev':
      value = hw.ev;
      minValue = -2.0;
      maxValue = 2.0;
      centerValue = 0.0;
      onChange = hw.setEv;
      valueFormatter = (v: number) => {
        'worklet';
        return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
      };
      onReset = () => hw.setEv(0);
      disabled = isEvDisabled;
      break;
    case 'iso':
      value = hw.iso;
      minValue = hw.capabilities.isoMin ?? 50;
      maxValue = hw.capabilities.isoMax ?? 3200;
      onChange = hw.setIso;
      isAuto = hw.isoAuto;
      valueFormatter = (v: number) => {
        'worklet';
        return `${Math.round(v)}`;
      };
      hideValueInAuto = true;
      autoValueText = 'AUTO';
      onReset = () => hw.setIsoAuto(true);
      onToggleAuto = hw.setIsoAuto;
      break;
    case 'shutter_speed':
      value = hw.shutterSpeed;
      minValue = 1;
      maxValue = 1000;
      onChange = hw.setShutterSpeed;
      isAuto = hw.shutterSpeedAuto;
      valueFormatter = (v: number) => {
        'worklet';
        return `1/${Math.round(v)}`;
      };
      hideValueInAuto = true;
      autoValueText = 'AUTO';
      onReset = () => hw.setShutterSpeedAuto(true);
      onToggleAuto = hw.setShutterSpeedAuto;
      break;
    case 'focus':
      value = hw.focusDistance;
      minValue = 0;
      maxValue = 10;
      onChange = hw.setFocusDistance;
      isAuto = hw.focusAuto;
      valueFormatter = (v: number) => {
        'worklet';
        if (v <= 0.1) return '∞';
        const distanceInMeters = 1 / v;
        if (distanceInMeters >= 1) {
          return `${distanceInMeters.toFixed(1)}m`;
        } else {
          return `${((distanceInMeters * 100)).toFixed(0)}cm`;
        }
      };
      hideValueInAuto = true;
      autoValueText = 'AF';
      onReset = () => hw.setFocusAuto(true);
      onToggleAuto = hw.setFocusAuto;
      break;
    default:
      return null;
  }

  const finalIsActive =
    isActiveOverride !== undefined
      ? isActiveOverride
      : parameter === 'grain'
      ? activeExtension === 'grain_intensity'
      : true;

  return (
    <Animated.View style={[styles.parameterExtensionContainer, parameterExtensionAnimatedStyle]}>
      <ParameterControl
        label=""
        isActive={finalIsActive}
        onPress={() => {}}
        value={value}
        minValue={minValue}
        maxValue={maxValue}
        centerValue={centerValue}
        onChange={onChange}
        variant="slider"
        isAuto={isAuto}
        valueFormatter={valueFormatter}
        hideValueInAuto={hideValueInAuto}
        autoValueText={autoValueText}
        onReset={onReset}
        onToggleAuto={onToggleAuto}
        disabled={disabled}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
  },
});
