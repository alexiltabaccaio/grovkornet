import React from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { useUIStore } from '../model/useUIStore';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { footerStyles } from './Footer.styles';

// Import modules
import { TextureModule } from './sections/film/TextureModule';
import { DevelopmentModule } from './sections/film/DevelopmentModule';
import { FlawsModule } from './sections/lens/FlawsModule';
import { ExposureModule } from './sections/body/ExposureModule';
import { LightingModule } from './sections/body/LightingModule';
import { CaptureModule } from './sections/body/CaptureModule';
import { OpticsModule } from './sections/lens/OpticsModule';
import { PreferencesModule } from './sections/system/PreferencesModule';

export const FooterParameters = () => {
  const uiStore = useUIStore(useShallow(state => ({
    activeModule: state.activeModule,
    activeParameter: state.activeParameter,
    setActiveParameter: state.setActiveParameter,
    isDebugEnabled: state.isDebugEnabled,
    setIsDebugEnabled: state.setIsDebugEnabled,
  })));

  const cameraStore = useCameraEffectsStore(useShallow(state => ({
    grainIntensity: state.grainIntensity,
    saturation: state.saturation,
    contrast: state.contrast,
    chromaticAberration: state.chromaticAberration,
    iso: state.iso,
    ev: state.ev,
    shutterSpeed: state.shutterSpeed,
    temperature: state.temperature,
    isoAuto: state.isoAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
    temperatureAuto: state.temperatureAuto,
    evAuto: state.evAuto,
    grainChroma: state.grainChroma,
    grainSize: state.grainSize,
    setGrainIntensity: state.setGrainIntensity,
    setGrainChroma: state.setGrainChroma,
    setGrainSize: state.setGrainSize,
    setSaturation: state.setSaturation,
    setContrast: state.setContrast,
    setChromaticAberration: state.setChromaticAberration,
    setIso: state.setIso,
    setEv: state.setEv,
    setShutterSpeed: state.setShutterSpeed,
    setTemperature: state.setTemperature,
    setIsoAuto: state.setIsoAuto,
    setShutterSpeedAuto: state.setShutterSpeedAuto,
    setTemperatureAuto: state.setTemperatureAuto,
    setEvAuto: state.setEvAuto,
    focusDistance: state.focusDistance,
    setFocusDistance: state.setFocusDistance,
    focusAuto: state.focusAuto,
    setFocusAuto: state.setFocusAuto,
    capabilities: state.capabilities,
    cameraId: state.cameraId,
    setCameraId: state.setCameraId,
    cameraAuto: state.cameraAuto,
    setCameraAuto: state.setCameraAuto,
    torchState: state.torchState,
    setTorchState: state.setTorchState,
    torchStrength: state.torchStrength,
    setTorchStrength: state.setTorchStrength,
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
    fpsSetting: state.fpsSetting,
    setFpsSetting: state.setFpsSetting,
    noiseReductionAuto: state.noiseReductionAuto,
    setNoiseReductionAuto: state.setNoiseReductionAuto,
    noiseReductionMode: state.noiseReductionMode,
    setNoiseReductionMode: state.setNoiseReductionMode,
    sharpening: state.sharpening,
    setSharpening: state.setSharpening,
    resetTool: state.resetTool,
  })));

  const { t } = useTranslation();
  const { handlePressWithDouble } = useDoublePress(cameraStore.resetTool);

  const renderModule = () => {
    switch (uiStore.activeModule) {
      case 'texture':
        return (
          <TextureModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            grainIntensity={cameraStore.grainIntensity}
            setGrainIntensity={cameraStore.setGrainIntensity}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'development':
        return (
          <DevelopmentModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            saturation={cameraStore.saturation}
            setSaturation={cameraStore.setSaturation}
            contrast={cameraStore.contrast}
            setContrast={cameraStore.setContrast}
            temperature={cameraStore.temperature}
            setTemperature={cameraStore.setTemperature}
            temperatureAuto={cameraStore.temperatureAuto}
            setTemperatureAuto={cameraStore.setTemperatureAuto}
            noiseReductionAuto={cameraStore.noiseReductionAuto}
            setNoiseReductionAuto={cameraStore.setNoiseReductionAuto}
            noiseReductionMode={cameraStore.noiseReductionMode}
            setNoiseReductionMode={cameraStore.setNoiseReductionMode}
            sharpening={cameraStore.sharpening}
            setSharpening={cameraStore.setSharpening}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'flaws':
        return (
          <FlawsModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            chromaticAberration={cameraStore.chromaticAberration}
            setChromaticAberration={cameraStore.setChromaticAberration}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'exposure':
        return (
          <ExposureModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            iso={cameraStore.iso}
            setIso={cameraStore.setIso}
            isoAuto={cameraStore.isoAuto}
            setIsoAuto={cameraStore.setIsoAuto}
            ev={cameraStore.ev}
            setEv={cameraStore.setEv}
            evAuto={cameraStore.evAuto}
            setEvAuto={cameraStore.setEvAuto}
            shutterSpeed={cameraStore.shutterSpeed}
            setShutterSpeed={cameraStore.setShutterSpeed}
            shutterSpeedAuto={cameraStore.shutterSpeedAuto}
            setShutterSpeedAuto={cameraStore.setShutterSpeedAuto}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'optics':
        return (
          <OpticsModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            focusDistance={cameraStore.focusDistance}
            setFocusDistance={cameraStore.setFocusDistance}
            focusAuto={cameraStore.focusAuto}
            setFocusAuto={cameraStore.setFocusAuto}
            capabilities={cameraStore.capabilities}
            cameraId={cameraStore.cameraId}
            setCameraId={cameraStore.setCameraId}
            cameraAuto={cameraStore.cameraAuto}
            setCameraAuto={cameraStore.setCameraAuto}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'lighting':
        return (
          <LightingModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            capabilities={cameraStore.capabilities}
            torchState={cameraStore.torchState}
            setTorchState={cameraStore.setTorchState}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'capture':
        return (
          <CaptureModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            aspectRatio={cameraStore.aspectRatio}
            setAspectRatio={cameraStore.setAspectRatio}
            resolutionSetting={cameraStore.resolutionSetting}
            setResolutionSetting={cameraStore.setResolutionSetting}
            fpsSetting={cameraStore.fpsSetting}
            setFpsSetting={cameraStore.setFpsSetting}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'preferences':
        // For now, mapping language and debug to preferences
        return (
          <PreferencesModule
            isDebugEnabled={uiStore.isDebugEnabled}
            setIsDebugEnabled={uiStore.setIsDebugEnabled}
          />
        );
      case 'none':
        return null;
      default:
        return (
          <Animated.View style={footerStyles.tabContent}>
            <Text style={footerStyles.infoText}>{t('footer.coming_soon')}</Text>
          </Animated.View>
        );
    }
  };

  return (
    <View style={footerStyles.tabContentWrapper}>
      {renderModule()}
    </View>
  );
};
