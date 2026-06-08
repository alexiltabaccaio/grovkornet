import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { controlPanelStyles } from './ControlPanel.styles';

// Import modules from feature slices
import { ColorModule, ToneModule, TextureModule, ArtifactsModule, DetailsModule } from '@features/film-controls';
import { OpticsModule } from '@features/lens-controls';
import { CaptureModule, ExposureModule, LightingModule, ProcessingModule } from '@features/body-controls';
import { PreferencesModule, PresetsModule, ThemeModule, DebugModule } from '@features/system-settings';

/**
 * Parameters acts as a router for the different camera control modules.
 * It has been simplified to follow the Single Responsibility Principle, 
 * moving state consumption into the individual modules.
 */
export const Parameters = React.memo(() => {
  const { activeModule, lastNonNoneModule } = useSystemStore(useShallow(state => ({
    activeModule: state.activeModule,
    lastNonNoneModule: state.lastNonNoneModule,
  })));

  const {
    resetEffect,
    setTemperatureAuto,
    setContrastAuto,
    setBlackLevelAuto,
    setHighlightsAuto,
    setPivotAuto,
  } = useFilmStore(useShallow(s => ({
    resetEffect: s.resetEffect,
    setTemperatureAuto: s.setTemperatureAuto,
    setContrastAuto: s.setContrastAuto,
    setBlackLevelAuto: s.setBlackLevelAuto,
    setHighlightsAuto: s.setHighlightsAuto,
    setPivotAuto: s.setPivotAuto,
  })));

  const { 
    setEvAuto, setIsoAuto, setShutterSpeedAuto, setTorchState, setFpsSetting
  } = useBodyStore(useShallow(s => ({
    setEvAuto: s.setEvAuto,
    setIsoAuto: s.setIsoAuto,
    setShutterSpeedAuto: s.setShutterSpeedAuto,
    setTorchState: s.setTorchState,
    setFpsSetting: s.setFpsSetting,
  })));

  const maxFps = useBodyStore(s => s.capabilities.maxFps);

  const { setFocusAuto, setCameraAuto } = useLensStore(useShallow(s => ({
    setFocusAuto: s.setFocusAuto,
    setCameraAuto: s.setCameraAuto,
  })));
  
  const { t } = useTranslation();
  
  const resetTool = useCallback((tool: string) => {
    if (tool === 'ev') setEvAuto(true);
    else if (tool === 'iso') setIsoAuto(true);
    else if (tool === 'shutter_speed') setShutterSpeedAuto(true);
    else if (tool === 'focus') setFocusAuto(true);
    else if (tool === 'temperature' || tool === 'tint') setTemperatureAuto(true);
    else if (tool === 'contrast') {
      setContrastAuto(true);
      setPivotAuto(true);
    }
    else if (tool === 'blackLevel') setBlackLevelAuto(true);
    else if (tool === 'highlights') setHighlightsAuto(true);
    else if (tool === 'pivot') setPivotAuto(true);
    else if (tool === 'camera_selection') setCameraAuto(true);
    else if (tool === 'torch') setTorchState(0);
    else if (tool === 'fps_setting') {
      const currentMaxFps = maxFps ?? 60;
      setFpsSetting(currentMaxFps >= 60 ? 60 : 30);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      resetEffect(tool as any); 
    }
  }, [setEvAuto, setIsoAuto, setShutterSpeedAuto, setFocusAuto, setTemperatureAuto, setContrastAuto, setBlackLevelAuto, setHighlightsAuto, setPivotAuto, setCameraAuto, setTorchState, maxFps, setFpsSetting, resetEffect]);

  const { handlePressWithDouble } = useDoublePress(resetTool);

  const renderActiveModule = activeModule === 'none' ? lastNonNoneModule : activeModule;

  const renderModuleContent = () => {
    switch (renderActiveModule) {
      case 'texture':
        return <TextureModule handlePressWithDouble={handlePressWithDouble} />;
      case 'details':
        return <DetailsModule handlePressWithDouble={handlePressWithDouble} />;
      case 'color':
        return <ColorModule handlePressWithDouble={handlePressWithDouble} />;
      case 'tone':
        return <ToneModule handlePressWithDouble={handlePressWithDouble} />;
      case 'artifacts':
        return <ArtifactsModule handlePressWithDouble={handlePressWithDouble} />;
      case 'exposure':
        return <ExposureModule handlePressWithDouble={handlePressWithDouble} />;
      case 'optics':
        return <OpticsModule handlePressWithDouble={handlePressWithDouble} />;
      case 'lighting':
        return <LightingModule handlePressWithDouble={handlePressWithDouble} />;
      case 'processing':
        return <ProcessingModule handlePressWithDouble={handlePressWithDouble} />;
      case 'capture':
        return <CaptureModule handlePressWithDouble={handlePressWithDouble} />;
      case 'preferences':
        return <PreferencesModule />;
      case 'presets':
        return <PresetsModule />;
      case 'theme':
        return <ThemeModule />;
      case 'debug':
        return <DebugModule />;
      case 'none':
        return null;
      default:
        return (
          <View style={controlPanelStyles.tabContent}>
            <Text style={controlPanelStyles.infoText}>{t('footer.coming_soon')}</Text>
          </View>
        );
    }
  };

  return (
    <View style={controlPanelStyles.tabContentWrapper}>
      {renderModuleContent()}
    </View>
  );
});

Parameters.displayName = 'Parameters';
