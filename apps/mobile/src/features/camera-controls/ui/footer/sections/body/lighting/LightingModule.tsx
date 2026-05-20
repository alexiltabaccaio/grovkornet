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

interface LightingModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const LightingModule = ({ handlePressWithDouble }: LightingModuleProps) => {
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

  const items: WheelItem[] = useMemo(() => [
    {
      id: 'torch',
      component: (
        <ConnectedParameter
          id="torch"
          label={t('parameters.torch')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
          disableGestures={true}
        />
      ),
    },
  ], [t, handlePressWithDouble]);

  if (!capabilities.hasTorch) return null;

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
