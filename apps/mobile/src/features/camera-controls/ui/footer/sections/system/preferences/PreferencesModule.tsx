import React, { useCallback, useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/components/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/components/ParameterWheel';
import { useTranslation } from 'react-i18next';

export const PreferencesModule = () => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const handlePressWithDouble = useCallback((param: ParameterType, action: () => void) => {
    action();
  }, []);

  const items: WheelItem[] = useMemo(() => [
    {
      id: 'language',
      component: (
        <ConnectedParameter
          id="language"
          label={t('parameters.language')}
          variant="text"
          handlePressWithDouble={handlePressWithDouble}
          disableGestures={true}
        />
      ),
    },
    {
      id: 'debug',
      component: (
        <ConnectedParameter
          id="debug"
          label={t('modules.debug')}
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
