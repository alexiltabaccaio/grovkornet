import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, ParameterControl, ParameterExtensionWrapper } from '@entities/system';
import { useBodyStore, useBodyWorklets } from '@entities/body';
import Animated, { SharedValue, useAnimatedStyle, interpolate, Extrapolation, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SliderExtension } from './components/SliderExtension';
import { Ionicons } from '@expo/vector-icons';

import { LanguageExtension, DebugExtension } from '@features/system-settings';
import { NoiseReductionExtension, GrainExtension, SaturationExtension } from '@features/film-controls';
import { LensSelectionExtension, ChromaticAberrationExtension } from '@features/lens-controls';
import { AspectRatioExtension, FpsExtension, ResolutionExtension } from '@features/body-controls';

import { logger } from '@shared/lib/logger';

interface ParameterExtensionsProps {
  translateY: SharedValue<number>;
}

export const ParameterExtensions = ({ translateY }: ParameterExtensionsProps) => {
  const { t } = useTranslation();
  const bodyWorklets = useBodyWorklets();

  const { activeParameter, activeExtension, setActiveExtension } = useSystemStore(useShallow(state => ({
    activeParameter: state.activeParameter,
    activeExtension: state.activeExtension,
    setActiveExtension: state.setActiveExtension,
  })));

  const {
    torchState,
    setTorchState,
    torchStrength,
    setTorchStrength,
    resolutionSetting,
    previewIn4k,
    setPreviewIn4k,
  } = useBodyStore(useShallow(state => ({
    torchState: state.torchState,
    setTorchState: state.setTorchState,
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
    resolutionSetting: state.resolutionSetting,
    previewIn4k: state.previewIn4k,
    setPreviewIn4k: state.setPreviewIn4k,
  })));

  const [localTorchState, setLocalTorchState] = React.useState(() => torchState.value);
  const [localResolutionSetting, setLocalResolutionSetting] = React.useState(() => resolutionSetting.value);
  const [localPreviewIn4k, setLocalPreviewIn4k] = React.useState(() => previewIn4k.value);

  // Sync state correctly via Reanimated reaction without reading during render
  useAnimatedReaction(
    () => torchState.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalTorchState)(currentValue);
      }
    },
    [torchState]
  );

  useAnimatedReaction(
    () => resolutionSetting.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalResolutionSetting)(currentValue);
      }
    },
    [resolutionSetting]
  );

  useAnimatedReaction(
    () => previewIn4k.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setLocalPreviewIn4k)(currentValue);
      }
    },
    [previewIn4k]
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (!translateY) return { opacity: 0 };

    const opacity = interpolate(
      translateY.value,
      [-90, -25, 0],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const parameterExtensionAnimatedStyle = useAnimatedStyle(() => {
    if (!translateY) return { opacity: 0 };

    const opacity = interpolate(
      translateY.value,
      [-35, -15, 0],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  if (!translateY || activeParameter === 'none') return null;

  switch (activeParameter) {
    case 'grain':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter="grain"
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <GrainExtension />
          </Animated.View>
        </View>
      );
    case 'chromatic_aberration':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter="chromatic_aberration"
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <ChromaticAberrationExtension />
          </Animated.View>
        </View>
      );
    case 'torch':
      return (
        <View style={styles.container}>
          <ParameterExtensionWrapper animatedStyle={parameterExtensionAnimatedStyle}>
            <ScrollView scrollEnabled={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  logger.debug('ParameterExtensions', 'Torch toggle pressed');
                  const next = torchState.value === 0 ? 1 : 0;
                  setTorchState(next);
                  setLocalTorchState(next);
                }}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={localTorchState === 0 ? "OFF" : "ON"}
                style={{ alignSelf: 'center' }}
              >
                <View
                  importantForAccessibility="no-hide-descendants"
                  accessibilityElementsHidden={true}
                  pointerEvents="none"
                >
                  <ParameterControl
                    label=""
                    isActive={false}
                    hideDebugRectangles={true}
                    onPress={() => {}}
                    value={torchState}
                    variant="text"
                    renderValue={true}
                    isToggle={true}
                    valueFormatter={(v) => {
                      'worklet';
                      return v === 0 ? 'OFF' : 'ON';
                    }}
                    disableGestures={true}
                  />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </ParameterExtensionWrapper>
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <ParameterControl
              label={t('parameters.torch_dimmer')}
              isActive={activeExtension === 'torch_strength'}
              onPress={() => setActiveExtension('torch_strength')}
              value={torchStrength}
              minValue={0.1}
              maxValue={1}
              onChange={setTorchStrength}
              onUpdateWorklet={bodyWorklets.updateTorchStrength}
              variant="slider"
              renderValue={true}
              valueFormatter={(v) => {
                'worklet';
                return `${(v * 100).toFixed(0)}`;
              }}
            />
          </Animated.View>
        </View>
      );
    case 'language':
      return <LanguageExtension animatedStyle={parameterExtensionAnimatedStyle} />;
    case 'debug':
      return <DebugExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'camera_selection':
      return <LensSelectionExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'noise_reduction':
      return <NoiseReductionExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'aspect_ratio':
      return <AspectRatioExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'fps_setting':
      return <FpsExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />;
    case 'resolution_setting':
      return (
        <View style={styles.container}>
          <ResolutionExtension parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle} />
          {localResolutionSetting === 0 && (
            <Animated.View style={[styles.previewIn4kContainer, animatedStyle]}>
              <View style={styles.toggleRowContainer}>
                <Text style={styles.toggleLabel} allowFontScaling={false}>
                  {t('parameters.preview_in_4k').toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    logger.debug('ParameterExtensions', 'Preview in 4K toggle pressed');
                    const next = previewIn4k.value === 0 ? 1 : 0;
                    setPreviewIn4k(next);
                    setLocalPreviewIn4k(next);
                  }}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={t('parameters.preview_in_4k')}
                  style={[
                    styles.pillButton,
                    localPreviewIn4k === 1 ? styles.pillButtonActive : styles.pillButtonInactive
                  ]}
                >
                  <Text style={styles.pillValueText} allowFontScaling={false}>
                    {localPreviewIn4k === 1 ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.warningContainer}>
                <Ionicons name="warning-outline" size={14} color="#FF453A" style={{ marginRight: 4 }} />
                <Text style={styles.warningText} allowFontScaling={false}>
                  {t('parameters.preview_in_4k_warning')}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      );

    case 'saturation':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter="saturation"
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
          <Animated.View style={[styles.childSubContainer, animatedStyle]}>
            <SaturationExtension />
          </Animated.View>
        </View>
      );

    // Slider-only parameters (no children)
    case 'bloom':
    case 'contrast':
    case 'temperature':
    case 'tint':
    case 'sharpening':
    case 'ev':
    case 'iso':
    case 'shutter_speed':
    case 'focus':
      return (
        <View style={styles.container}>
          <SliderExtension
            parameter={activeParameter}
            parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
          />
        </View>
      );
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  childSubContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    width: '100%',
    gap: 40,
  },
  previewIn4kContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    width: '100%',
    gap: 8,
  },
  toggleRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleLabel: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillButton: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    minWidth: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: '#FFF',
  },
  pillButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: '#333',
  },
  pillValueText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    padding: 0,
    margin: 0,
    letterSpacing: 0.5,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  warningText: {
    color: '#FF453A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
