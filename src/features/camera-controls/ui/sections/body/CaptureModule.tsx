import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ParameterType } from '@shared/types/camera';
import { ParameterControl } from '../../ParameterControl';
import { footerStyles } from '../../Footer.styles';
import { SharedValue } from 'react-native-reanimated';

interface CaptureModuleProps {
  activeParameter: ParameterType;
  setActiveParameter: (param: ParameterType) => void;
  aspectRatio: SharedValue<number>;
  setAspectRatio: (value: number) => void;
  resolutionSetting: SharedValue<number>;
  setResolutionSetting: (value: number) => void;
  fpsSetting: SharedValue<number>;
  setFpsSetting: (value: number) => void;
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];
const RESOLUTIONS = ['720p', '1080p', '4K'];
const FPS_VALUES = ['24', '30', '60'];

export const CaptureModule = ({
  activeParameter,
  setActiveParameter,
  aspectRatio,
  setAspectRatio,
  resolutionSetting,
  setResolutionSetting,
  fpsSetting,
  setFpsSetting,
  handlePressWithDouble,
}: CaptureModuleProps) => {
  const { t } = useTranslation();

  return (
    <Animated.View style={footerStyles.tabContent}>
      <View style={footerStyles.imageToolsContainer}>
        <ParameterControl
          label={t('parameters.aspect_ratio')}
          isActive={activeParameter === 'aspect_ratio'}
          onPress={() => handlePressWithDouble('aspect_ratio', () => setActiveParameter('aspect_ratio'))}
          value={aspectRatio}
          minValue={0}
          maxValue={ASPECT_RATIOS.length - 1}
          onChange={setAspectRatio}
          variant="text"
          valueFormatter={(v) => {
            'worklet';
            const index = Math.round(v);
            if (index === 0) return '4:3';
            if (index === 1) return '16:9';
            if (index === 2) return '1:1';
            if (index === 3) return '3:2';
            return '65:24';
          }}
        />
        <ParameterControl
          label={t('parameters.resolution_setting')}
          isActive={activeParameter === 'resolution_setting'}
          onPress={() => handlePressWithDouble('resolution_setting', () => setActiveParameter('resolution_setting'))}
          value={resolutionSetting}
          minValue={0}
          maxValue={RESOLUTIONS.length - 1}
          onChange={setResolutionSetting}
          variant="text"
          valueFormatter={(v) => {
            'worklet';
            const index = Math.round(v);
            if (index === 0) return '720p';
            if (index === 1) return '1080p';
            return '4K';
          }}
        />
        <ParameterControl
          label={t('parameters.fps_setting')}
          isActive={activeParameter === 'fps_setting'}
          onPress={() => handlePressWithDouble('fps_setting', () => setActiveParameter('fps_setting'))}
          value={fpsSetting}
          minValue={0}
          maxValue={FPS_VALUES.length - 1}
          onChange={setFpsSetting}
          variant="text"
          valueFormatter={(v) => {
            'worklet';
            const index = Math.round(v);
            if (index === 0) return '24';
            if (index === 1) return '30';
            return '60';
          }}
        />
      </View>
    </Animated.View>
  );
};
