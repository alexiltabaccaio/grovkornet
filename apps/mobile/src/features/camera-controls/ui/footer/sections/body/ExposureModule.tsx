import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/ParameterWheel';
import { useTranslation } from 'react-i18next';

interface ExposureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const ExposureModule = ({ handlePressWithDouble }: ExposureModuleProps) => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const items: WheelItem[] = useMemo(() => [
    {
      id: 'iso',
      component: (
        <ConnectedParameter
          id="iso"
          label={t('parameters.iso')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'shutter_speed',
      component: (
        <ConnectedParameter
          id="shutter_speed"
          label={t('parameters.shutter_speed')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'ev',
      component: (
        <ConnectedParameter
          id="ev"
          label={t('parameters.ev')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
  ], [t, handlePressWithDouble]);

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
