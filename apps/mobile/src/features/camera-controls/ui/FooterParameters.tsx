import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useStylesStore } from '../model/useStylesStore';
import { useUIStore } from '../model/useUIStore';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { footerStyles } from './Footer.styles';
import { ModuleType } from '@shared/types/camera';

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
  const { t } = useTranslation();
  
  const resetTool = (tool: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
    resetEffect(tool as any); 
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
