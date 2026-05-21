import React, { useMemo, useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { ParameterType } from '@shared/types/camera';
import { footerStyles } from '@features/camera-controls/ui/footer/Footer.styles';
import { ConnectedParameter } from '@features/camera-controls/ui/footer/components/ConnectedParameter';
import { ParameterWheel, WheelItem } from '@features/camera-controls/ui/footer/components/ParameterWheel';
import { useTranslation } from 'react-i18next';

export interface ParameterConfig {
  id: ParameterType;
  labelKey?: string;
  visible?: boolean;
}

interface GenericParameterModuleProps {
  parameters: (ParameterType | ParameterConfig)[];
  handlePressWithDouble?: (param: ParameterType, action: () => void) => void;
}

export const GenericParameterModule = ({
  parameters,
  handlePressWithDouble,
}: GenericParameterModuleProps) => {
  const { t } = useTranslation();
  const { activeParameter, setActiveParameter } = useUIStore(
    useShallow((s) => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  const defaultHandlePressWithDouble = useCallback((_param: ParameterType, action: () => void) => {
    action();
  }, []);

  const pressHandler = handlePressWithDouble || defaultHandlePressWithDouble;

  const items = useMemo(() => {
    const list: WheelItem[] = [];
    for (const item of parameters) {
      const config: ParameterConfig = typeof item === 'string' ? { id: item } : item;
      if (config.visible === false) {
        continue;
      }
      const labelKey = config.labelKey || `parameters.${config.id}`;
      list.push({
        id: config.id,
        component: (
          <ConnectedParameter
            id={config.id}
            label={t(labelKey)}
            variant="text"
            handlePressWithDouble={pressHandler}
            disableGestures={true}
          />
        ),
      });
    }
    return list;
  }, [parameters, t, pressHandler]);

  if (items.length === 0) return null;

  return (
    <Animated.View style={footerStyles.tabContent}>
      <ParameterWheel
        items={items}
        activeParameter={activeParameter}
        setActiveParameter={setActiveParameter}
        handlePressWithDouble={pressHandler}
      />
    </Animated.View>
  );
};
