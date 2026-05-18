import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { footerStyles } from './Footer.styles';
import { ModuleType } from '@shared/types/camera';

import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';

// Import modules
import { TextureModule } from './sections/film/TextureModule';
import { DevelopmentModule } from './sections/film/DevelopmentModule';
import { FlawsModule } from './sections/lens/FlawsModule';
import { ExposureModule } from './sections/body/ExposureModule';
import { LightingModule } from './sections/body/LightingModule';
import { CaptureModule } from './sections/body/CaptureModule';
import { OpticsModule } from './sections/lens/OpticsModule';
import { PreferencesModule } from './sections/system/PreferencesModule';

/**
 * FooterParameters acts as a router for the different camera control modules.
 * It has been simplified to follow the Single Responsibility Principle, 
 * moving state consumption into the individual modules.
 */
export const FooterParameters = () => {
  const { activeModule } = useUIStore(useShallow(state => ({
    activeModule: state.activeModule,
  })));

  const resetEffect = useStylesStore(s => s.resetEffect);
  const { 
    setEvAuto, setIsoAuto, setShutterSpeedAuto, setFocusAuto, setTemperatureAuto, setCameraAuto,
    setTorchState, setFpsSetting, capabilities
  } = useHardwareStore(useShallow(s => ({
    setEvAuto: s.setEvAuto,
    setIsoAuto: s.setIsoAuto,
    setShutterSpeedAuto: s.setShutterSpeedAuto,
    setFocusAuto: s.setFocusAuto,
    setTemperatureAuto: s.setTemperatureAuto,
    setCameraAuto: s.setCameraAuto,
    setTorchState: s.setTorchState,
    setFpsSetting: s.setFpsSetting,
    capabilities: s.capabilities,
  })));
  
  const { t } = useTranslation();
  
  const resetTool = (tool: string) => {
    if (tool === 'ev') setEvAuto(true);
    else if (tool === 'iso') setIsoAuto(true);
    else if (tool === 'shutter_speed') setShutterSpeedAuto(true);
    else if (tool === 'focus') setFocusAuto(true);
    else if (tool === 'temperature') setTemperatureAuto(true);
    else if (tool === 'camera_selection') setCameraAuto(true);
    else if (tool === 'torch') setTorchState(0);
    else if (tool === 'fps_setting') {
      const maxFps = capabilities.maxFps ?? 60;
      setFpsSetting(maxFps >= 60 ? 60 : 30);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      resetEffect(tool as any); 
    }
  };

  const { handlePressWithDouble } = useDoublePress(resetTool);

  const [lastActive, setLastActive] = useState<ModuleType>(activeModule);
  
  // Adjust state during render to track the last non-none module
  if (activeModule !== 'none' && activeModule !== lastActive) {
    setLastActive(activeModule);
  }

  const renderActiveModule = activeModule === 'none' ? lastActive : activeModule;

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
          <View style={footerStyles.tabContent}>
            <Text style={footerStyles.infoText}>{t('footer.coming_soon')}</Text>
          </View>
        );
    }
  };

  return (
    <View style={footerStyles.tabContentWrapper}>
      {renderModuleContent()}
    </View>
  );
};
