import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { FooterParameterControl } from './FooterParameterControl';
import { LanguageThumb, DebugThumb } from '@shared/ui';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';

export const FooterParameters = () => {
  const {
    activeModule,
    activeParameter,
    setActiveParameter,
    grainIntensity,
    saturation,
    contrast,
    chromaticAberration,
    isDebugEnabled,
    iso,
    ev,
    shutterSpeed,
    whiteBalance,
    isoAuto,
    shutterSpeedAuto,
    whiteBalanceAuto,
    evAuto,
    setGrainIntensity,
    setSaturation,
    setContrast,
    setChromaticAberration,
    setIso,
    setEv,
    setShutterSpeed,
    setWhiteBalance,
    setIsoAuto,
    setShutterSpeedAuto,
    setWhiteBalanceAuto,
    setEvAuto,
    setIsDebugEnabled,
    resetTool,
  } = useCameraEffectsStore(useShallow(state => ({
    activeModule: state.activeModule,
    activeParameter: state.activeParameter,
    setActiveParameter: state.setActiveParameter,
    grainIntensity: state.grainIntensity,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    iso: state.iso,
    ev: state.ev,
    shutterSpeed: state.shutterSpeed,
    whiteBalance: state.whiteBalance,
    isoAuto: state.isoAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
    whiteBalanceAuto: state.whiteBalanceAuto,
    evAuto: state.evAuto,
    isDebugEnabled: state.isDebugEnabled,
    setGrainIntensity: state.setGrainIntensity,
    setSaturation: state.setSaturation,
    setContrast: state.setContrast,
    setChromaticAberration: state.setChromaticAberration,
    setIso: state.setIso,
    setEv: state.setEv,
    setShutterSpeed: state.setShutterSpeed,
    setWhiteBalance: state.setWhiteBalance,
    setIsoAuto: state.setIsoAuto,
    setShutterSpeedAuto: state.setShutterSpeedAuto,
    setWhiteBalanceAuto: state.setWhiteBalanceAuto,
    setEvAuto: state.setEvAuto,
    setIsDebugEnabled: state.setIsDebugEnabled,
    resetTool: state.resetTool,
  })));

  const { t, i18n } = useTranslation();
  const { handlePressWithDouble } = useDoublePress(resetTool);

  return (
    <View style={styles.tabContentWrapper}>
      {activeModule === 'grain' && (
        <Animated.View style={styles.tabContent}>
          <FooterParameterControl
            label={t('parameters.amount')}
            isActive={activeParameter === 'grain'}
            onPress={() => handlePressWithDouble('grain', () => setActiveParameter('grain'))}
            value={grainIntensity}
            maxValue={1.0}
            onChange={setGrainIntensity}
            icon="water-outline"
          />
        </Animated.View>
      )}

      {activeModule === 'color_grading' && (
        <Animated.View style={styles.tabContent}>
          <View style={styles.imageToolsContainer}>
            <FooterParameterControl
              label={t('parameters.saturation')}
              isActive={activeParameter === 'saturation'}
              onPress={() => handlePressWithDouble('saturation', () => setActiveParameter('saturation'))}
              value={saturation}
              maxValue={2.0}
              onChange={setSaturation}
              icon="color-filter-outline"
            />
            <FooterParameterControl
              label={t('parameters.contrast')}
              isActive={activeParameter === 'contrast'}
              onPress={() => handlePressWithDouble('contrast', () => setActiveParameter('contrast'))}
              value={contrast}
              maxValue={2.0}
              onChange={setContrast}
              icon="contrast-outline"
            />
          </View>
        </Animated.View>
      )}

      {activeModule === 'lens_effects' && (
        <Animated.View style={styles.tabContent}>
          <FooterParameterControl
            label={t('parameters.phase_shift')}
            isActive={activeParameter === 'chromatic_aberration'}
            onPress={() => handlePressWithDouble('chromatic_aberration', () => setActiveParameter('chromatic_aberration'))}
            value={chromaticAberration}
            maxValue={2.0}
            onChange={setChromaticAberration}
            icon="aperture-outline"
          />
        </Animated.View>
      )}

      {activeModule === 'language' && (
        <Animated.View style={styles.tabContent}>
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

      {activeModule === 'debug' && (
        <Animated.View style={styles.tabContent}>
          <View style={styles.imageToolsContainer}>
            <DebugThumb
              label={t('modules.debug')}
              isActive={isDebugEnabled}
              onPress={() => setIsDebugEnabled(!isDebugEnabled)}
            />
          </View>
        </Animated.View>
      )}
      
      {activeModule === 'manual_exposure' && (
        <Animated.View style={styles.tabContent}>
          <View style={styles.imageToolsContainer}>
            <FooterParameterControl
              label={t('parameters.iso')}
              isActive={activeParameter === 'iso'}
              onPress={() => handlePressWithDouble('iso', () => setActiveParameter('iso'))}
              value={iso}
              minValue={50}
              maxValue={3200}
              onChange={setIso}
              variant="text"
              isAuto={isoAuto}
              onLongPress={() => setIsoAuto(true)}
            />
            <FooterParameterControl
              label={t('parameters.ev')}
              isActive={activeParameter === 'ev'}
              onPress={() => handlePressWithDouble('ev', () => setActiveParameter('ev'))}
              value={ev}
              minValue={-2.0}
              maxValue={2.0}
              onChange={setEv}
              variant="text"
              isAuto={evAuto}
              onLongPress={() => setEvAuto(true)}
              valueFormatter={(v) => {
                'worklet';
                return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
              }}
            />
            <FooterParameterControl
              label={t('parameters.shutter_speed')}
              isActive={activeParameter === 'shutter_speed'}
              onPress={() => handlePressWithDouble('shutter_speed', () => setActiveParameter('shutter_speed'))}
              value={shutterSpeed}
              minValue={1}
              maxValue={1000}
              onChange={setShutterSpeed}
              variant="text"
              isAuto={shutterSpeedAuto}
              onLongPress={() => setShutterSpeedAuto(true)}
              valueFormatter={(v) => {
                'worklet';
                return `1/${Math.round(v)}`;
              }}
            />
            <FooterParameterControl
              label={t('parameters.white_balance')}
              isActive={activeParameter === 'white_balance'}
              onPress={() => handlePressWithDouble('white_balance', () => setActiveParameter('white_balance'))}
              value={whiteBalance}
              minValue={2000}
              maxValue={10000}
              onChange={setWhiteBalance}
              variant="text"
              isAuto={whiteBalanceAuto}
              onLongPress={() => setWhiteBalanceAuto(true)}
              valueFormatter={(v) => {
                'worklet';
                return `${Math.round(v)}K`;
              }}
            />
          </View>
        </Animated.View>
      )}

      {activeModule !== 'grain' && activeModule !== 'color_grading' && activeModule !== 'lens_effects' && activeModule !== 'manual_exposure' && activeModule !== 'language' && activeModule !== 'debug' && activeModule !== 'none' && (
        <Animated.View style={styles.tabContent}>
          <Text style={styles.infoText}>{t('footer.coming_soon')}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
