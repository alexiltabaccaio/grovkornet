import React from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/ParameterWheel';
import { useTranslation } from 'react-i18next';

interface DevelopmentModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const DevelopmentModule = ({ handlePressWithDouble }: DevelopmentModuleProps) => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const items: WheelItem[] = [
    {
      id: 'saturation',
      component: (
        <ConnectedParameter
          id="saturation"
          label={t('parameters.saturation')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'contrast',
      component: (
        <ConnectedParameter
          id="contrast"
          label={t('parameters.contrast')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'temperature',
      component: (
        <ConnectedParameter
          id="temperature"
          label={t('parameters.temperature')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'tint',
      component: (
        <ConnectedParameter
          id="tint"
          label={t('parameters.tint')}
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
