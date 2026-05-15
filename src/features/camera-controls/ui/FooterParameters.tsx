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
import { GrainModule } from './modules/GrainModule';
import { ColorGradingModule } from './modules/ColorGradingModule';
import { LensEffectsModule } from './modules/LensEffectsModule';
import { ManualExposureModule } from './modules/ManualExposureModule';
import { LanguageModule } from './modules/LanguageModule';
import { DebugModule } from './modules/DebugModule';
import { FocusModule } from './modules/FocusModule';
import { LensModule } from './modules/LensModule';

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
    whiteBalance: state.whiteBalance,
    isoAuto: state.isoAuto,
    shutterSpeedAuto: state.shutterSpeedAuto,
    whiteBalanceAuto: state.whiteBalanceAuto,
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
    setWhiteBalance: state.setWhiteBalance,
    setIsoAuto: state.setIsoAuto,
    setShutterSpeedAuto: state.setShutterSpeedAuto,
    setWhiteBalanceAuto: state.setWhiteBalanceAuto,
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
    resetTool: state.resetTool,
  })));

  const { t } = useTranslation();
  const { handlePressWithDouble } = useDoublePress(cameraStore.resetTool);

  const renderModule = () => {
    switch (uiStore.activeModule) {
      case 'grain':
        return (
          <GrainModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            grainIntensity={cameraStore.grainIntensity}
            setGrainIntensity={cameraStore.setGrainIntensity}
            grainChroma={cameraStore.grainChroma}
            setGrainChroma={cameraStore.setGrainChroma}
            grainSize={cameraStore.grainSize}
            setGrainSize={cameraStore.setGrainSize}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'color_grading':
        return (
          <ColorGradingModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            saturation={cameraStore.saturation}
            setSaturation={cameraStore.setSaturation}
            contrast={cameraStore.contrast}
            setContrast={cameraStore.setContrast}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'lens_effects':
        return (
          <LensEffectsModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            chromaticAberration={cameraStore.chromaticAberration}
            setChromaticAberration={cameraStore.setChromaticAberration}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'manual_exposure':
        return (
          <ManualExposureModule
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
            whiteBalance={cameraStore.whiteBalance}
            setWhiteBalance={cameraStore.setWhiteBalance}
            whiteBalanceAuto={cameraStore.whiteBalanceAuto}
            setWhiteBalanceAuto={cameraStore.setWhiteBalanceAuto}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'focus':
        return (
          <FocusModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            focusDistance={cameraStore.focusDistance}
            setFocusDistance={cameraStore.setFocusDistance}
            focusAuto={cameraStore.focusAuto}
            setFocusAuto={cameraStore.setFocusAuto}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'lens':
        return (
          <LensModule
            activeParameter={uiStore.activeParameter}
            setActiveParameter={uiStore.setActiveParameter}
            capabilities={cameraStore.capabilities}
            cameraId={cameraStore.cameraId}
            setCameraId={cameraStore.setCameraId}
            cameraAuto={cameraStore.cameraAuto}
            setCameraAuto={cameraStore.setCameraAuto}
            torchState={cameraStore.torchState}
            setTorchState={cameraStore.setTorchState}
            torchStrength={cameraStore.torchStrength}
            setTorchStrength={cameraStore.setTorchStrength}
            handlePressWithDouble={handlePressWithDouble}
          />
        );
      case 'language':
        return <LanguageModule />;
      case 'debug':
        return (
          <DebugModule
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
