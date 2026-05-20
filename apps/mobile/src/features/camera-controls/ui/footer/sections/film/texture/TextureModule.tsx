import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/components/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/components/ParameterWheel';
import { useTranslation } from 'react-i18next';

interface TextureModuleProps {
  handlePressWithDouble: (param: ParameterType, action: () => void) => void;
}

export const TextureModule = ({ handlePressWithDouble }: TextureModuleProps) => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const items: WheelItem[] = useMemo(() => [
    {
      id: 'grain',
      component: (
        <ConnectedParameter
          id="grain"
          label={t('parameters.grain')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
          disableGestures={true}
        />
      ),
    },
    {
      id: 'sharpening',
      component: (
        <ConnectedParameter
          id="sharpening"
          label={t('parameters.sharpening')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
          disableGestures={true}
        />
      ),
    },
    {
      id: 'noise_reduction',
      component: (
        <ConnectedParameter
          id="noise_reduction"
          label={t('parameters.noise_reduction')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
          disableGestures={true}
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
