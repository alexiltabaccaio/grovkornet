import React from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/ParameterWheel';
import { useTranslation } from 'react-i18next';

interface CaptureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const CaptureModule = ({ handlePressWithDouble }: CaptureModuleProps) => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const items: WheelItem[] = [
    {
      id: 'aspect_ratio',
      component: (
        <ConnectedParameter
          id="aspect_ratio"
          label={t('parameters.aspect_ratio')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'resolution_setting',
      component: (
        <ConnectedParameter
          id="resolution_setting"
          label={t('parameters.resolution_setting')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'fps_setting',
      component: (
        <ConnectedParameter
          id="fps_setting"
          label={t('parameters.fps_setting')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
  ];

  return (
    <Animated.View style={footerStyles.tabContent}>
      <ParameterWheel
        items={items}
        activeParameter={activeParameter}
        setActiveParameter={setActiveParameter}
        handlePressWithDouble={handlePressWithDouble}
      />
    </Animated.View>
  );
};
