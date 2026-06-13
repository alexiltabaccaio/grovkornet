import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { useControlPanelStore } from '@entities/system';
import { useDoublePress } from '@shared/lib/hooks/useDoublePress';
import { useResetTool } from '../lib/useResetTool';
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
export const Parameters = () => {
  const { activeModule, lastNonNoneModule } = useControlPanelStore(useShallow(state => ({
    activeModule: state.activeModule,
    lastNonNoneModule: state.lastNonNoneModule,
  })));

  const { t } = useTranslation();
  const resetTool = useResetTool();

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
};
