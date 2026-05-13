import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SharedValue, useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Skia } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';

import { TabType, ParameterType, ModuleType } from '@shared/types/camera';
import { FILM_GRAIN_SHADER } from '@shared/shaders/FilmGrainShader';

import { BottomNavigationBar } from './BottomNavigationBar';
import { FilterPillMenu } from './FilterPillMenu';
import { FilterParameterThumb } from './FilterParameterThumb';
import { LanguageThumb } from './LanguageThumb';
import { useDoublePress } from '../lib/useDoublePress';

const grainEffect = Skia.RuntimeEffect.Make(FILM_GRAIN_SHADER);

interface FooterProps {
  enabled: SharedValue<boolean>;
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  chromaticAberration: SharedValue<number>;
  activeTab: TabType;
  activeModule: ModuleType;
  activeParameter: ParameterType;
  onGrainToggle: (val: boolean) => void;
  onTabChange: (tab: TabType) => void;
  onModuleChange: (module: ModuleType) => void;
  onParameterChange: (tool: ParameterType) => void;
  setChromaticAberration: (val: number) => void;
  onResetTool: (tool: 'grain' | ParameterType) => void;
}

export const Footer = ({
  grainIntensity,
  saturation,
  contrast,
  chromaticAberration,
  activeTab,
  activeModule,
  activeParameter,
  onTabChange,
  onModuleChange,
  onParameterChange,
  onResetTool,
}: FooterProps) => {
  const { t, i18n } = useTranslation();
  const { handlePressWithDouble } = useDoublePress(onResetTool);

  const uniforms = useDerivedValue(() => ({
    time: 0,
    resolution: [48, 48],
    intensity: 0.6,
  }));

  const saturationFillStyle = useAnimatedStyle(() => ({ height: `${(saturation.value / 2.0) * 100}%` }));
  const contrastFillStyle = useAnimatedStyle(() => ({ height: `${(contrast.value / 2.0) * 100}%` }));
  const abFillStyle = useAnimatedStyle(() => ({ height: `${(chromaticAberration.value / 2.0) * 100}%` }));
  const grainFillStyle = useAnimatedStyle(() => ({ height: `${Math.min(Math.max(grainIntensity.value * 100, 0), 100)}%` }));

  const handleTabChange = (tab: TabType) => {
    const newTab = activeTab === tab ? 'none' : tab;
    if (newTab === 'color') onModuleChange('color_grading');
    else if (newTab === 'tape') onModuleChange('grain');
    else if (newTab === 'lens') onModuleChange('lens_effects');
    else if (newTab === 'settings') onModuleChange('language');
    else onModuleChange('none');
    onTabChange(newTab);
  };

  return (
    <View style={styles.container}>
      {activeTab !== 'none' && (
        <View style={styles.topFooter}>
          <FilterPillMenu
            activeTab={activeTab}
            activeModule={activeModule}
            onModuleChange={onModuleChange}
          />

          <View style={styles.tabContentWrapper}>
            {activeModule === 'grain' && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
                <FilterParameterThumb
                  label={t('parameters.amount')}
                  isActive={activeParameter === 'grain'}
                  onPress={() => handlePressWithDouble('grain', () => onParameterChange('grain'))}
                  progressStyle={grainFillStyle}
                  skiaEffect={grainEffect}
                  skiaUniforms={uniforms}
                />
              </Animated.View>
            )}

            {activeModule === 'color_grading' && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
                <View style={styles.imageToolsContainer}>
                  <FilterParameterThumb
                    label={t('parameters.saturation')}
                    isActive={activeParameter === 'saturation'}
                    onPress={() => handlePressWithDouble('saturation', () => onParameterChange('saturation'))}
                    progressStyle={saturationFillStyle}
                    icon="color-filter-outline"
                  />
                  <FilterParameterThumb
                    label={t('parameters.contrast')}
                    isActive={activeParameter === 'contrast'}
                    onPress={() => handlePressWithDouble('contrast', () => onParameterChange('contrast'))}
                    progressStyle={contrastFillStyle}
                    icon="contrast-outline"
                  />
                </View>
              </Animated.View>
            )}

            {activeModule === 'lens_effects' && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
                <FilterParameterThumb
                  label={t('parameters.phase_shift')}
                  isActive={activeParameter === 'chromatic_aberration'}
                  onPress={() => handlePressWithDouble('chromatic_aberration', () => onParameterChange('chromatic_aberration'))}
                  progressStyle={abFillStyle}
                  icon="aperture-outline"
                />
              </Animated.View>
            )}

            {activeModule === 'language' && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
                <View style={styles.imageToolsContainer}>
                  <LanguageThumb
                    label="English"
                    languageCode="en"
                    isActive={i18n.language === 'en' || i18n.language.startsWith('en')}
                    onPress={() => i18n.changeLanguage('en')}
                  />
                  <LanguageThumb
                    label="Italiano"
                    languageCode="it"
                    isActive={i18n.language === 'it' || i18n.language.startsWith('it')}
                    onPress={() => i18n.changeLanguage('it')}
                  />
                </View>
              </Animated.View>
            )}

            {activeModule !== 'grain' && activeModule !== 'color_grading' && activeModule !== 'lens_effects' && activeModule !== 'language' && activeModule !== 'none' && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.tabContent}>
                <Text style={styles.infoText}>{t('footer.coming_soon')}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      )}

      <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  topFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: 10,
    height: 120,
    justifyContent: 'flex-end',
  },
  tabContentWrapper: {
    height: 65,
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  imageToolsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
