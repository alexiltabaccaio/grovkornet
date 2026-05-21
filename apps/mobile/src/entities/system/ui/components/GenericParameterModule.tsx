import React, { useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '../../model/useSystemStore';
import { ParameterType } from '../../model/types';
import { ConnectedParameter } from './ConnectedParameter';
import { ParameterWheel, WheelItem } from './ParameterWheel';
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
  const { activeParameter, setActiveParameter } = useSystemStore(
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
    <Animated.View style={styles.tabContent}>
      <ParameterWheel
        items={items}
        activeParameter={activeParameter}
        setActiveParameter={setActiveParameter}
        handlePressWithDouble={pressHandler}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

