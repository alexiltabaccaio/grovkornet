import React from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/ParameterWheel';
import { useTranslation } from 'react-i18next';
import { ImageSourcePropType } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const enFlag = require('../../../../../../../assets/flags/en.png') as ImageSourcePropType;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itFlag = require('../../../../../../../assets/flags/it.png') as ImageSourcePropType;

export const PreferencesModule = () => {
  const { i18n, t } = useTranslation();
  const { activeParameter, setActiveParameter, isDebugEnabled, setIsDebugEnabled } = useUIStore(
    useShallow(s => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
      isDebugEnabled: s.isDebugEnabled,
      setIsDebugEnabled: s.setIsDebugEnabled,
    }))
  );

  const handlePressWithDouble = (param: ParameterType, action: () => void) => {
    action();
  };

  const items: WheelItem[] = [
    {
      id: 'language',
      component: (
        <ConnectedParameter
          id="language"
          label={t('parameters.language')}
          imageSource={i18n.language.startsWith('it') ? itFlag : enFlag}
          handlePressWithDouble={handlePressWithDouble}
        />
      ),
    },
    {
      id: 'debug',
      component: (
        <ConnectedParameter
          id="debug"
          label={t('modules.debug')}
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
