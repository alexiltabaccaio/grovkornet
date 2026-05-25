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
import { DevelopmentModule, TextureModule } from '@features/film-controls';
import { FlawsModule, OpticsModule } from '@features/lens-controls';
import { CaptureModule, ExposureModule, LightingModule } from '@features/body-controls';
import { PreferencesModule } from '@features/system-settings';

/**
 * Parameters acts as a router for the different camera control modules.
 * It has been simplified to follow the Single Responsibility Principle, 
 * moving state consumption into the individual modules.
 */
export const Parameters = () => {
  const { activeModule, lastNonNoneModule } = useSystemStore(useShallow(state => ({
    activeModule: state.activeModule,
    lastNonNoneModule: state.lastNonNoneModule,
  })));

  const { resetEffect, setTemperatureAuto } = useFilmStore(useShallow(s => ({
    resetEffect: s.resetEffect,
    setTemperatureAuto: s.setTemperatureAuto,
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
  }, [setEvAuto, setIsoAuto, setShutterSpeedAuto, setFocusAuto, setTemperatureAuto, setCameraAuto, setTorchState, maxFps, setFpsSetting, resetEffect]);

  const { handlePressWithDouble } = useDoublePress(resetTool);

  const renderActiveModule = activeModule === 'none' ? lastNonNoneModule : activeModule;

  const renderModuleContent = () => {
    switch (renderActiveModule) {
      case 'texture':
        return <TextureModule handlePressWithDouble={handlePressWithDouble} />;
      case 'development':
        return <DevelopmentModule handlePressWithDouble={handlePressWithDouble} />;
      case 'flaws':
        return <FlawsModule handlePressWithDouble={handlePressWithDouble} />;
      case 'exposure':
        return <ExposureModule handlePressWithDouble={handlePressWithDouble} />;
      case 'optics':
        return <OpticsModule handlePressWithDouble={handlePressWithDouble} />;
      case 'lighting':
        return <LightingModule handlePressWithDouble={handlePressWithDouble} />;
      case 'capture':
        return <CaptureModule handlePressWithDouble={handlePressWithDouble} />;
      case 'preferences':
        return <PreferencesModule />;
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
};
