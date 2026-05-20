import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/components/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/components/ParameterWheel';
import { useTranslation } from 'react-i18next';

interface OpticsModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const OpticsModule = ({ handlePressWithDouble }: OpticsModuleProps) => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const { capabilities } = useHardwareStore(
    useShallow(s => ({
      capabilities: s.capabilities,
    }))
  );

  const items: WheelItem[] = useMemo(() => {
    const arr: WheelItem[] = [];

    if (capabilities.availableCameras.length > 0) {
      arr.push({
        id: 'camera_selection',
        component: (
          <ConnectedParameter
            id="camera_selection"
            label={t('parameters.lens')}
            variant="text"
            handlePressWithDouble={handlePressWithDouble}
            disableGestures={true}
          />
        ),
      });
    }

    arr.push({
      id: 'focus',
      component: (
        <ConnectedParameter
          id="focus"
          label={t('parameters.focus')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
          disableGestures={true}
        />
      ),
    });

    return arr;
  }, [capabilities.availableCameras.length, t, handlePressWithDouble]);

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
