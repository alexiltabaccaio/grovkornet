import React, { useMemo, useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SystemParameterWheel, WheelItem } from './SystemParameterWheel';
import { useTranslation } from 'react-i18next';

export interface ParameterConfig<T extends string> {
  id: T;
  labelKey?: string;
  visible?: boolean;
}

interface GenericParameterModuleProps<T extends string> {
  parameters: (T | ParameterConfig<T>)[];
  activeParameter: T;
  setActiveParameter: (param: T) => void;
  renderItem: (id: T, label: string) => React.ReactNode;
  handlePressWithDouble?: (param: T, action: () => void) => void;
}

const GenericParameterModuleImpl = <T extends string>({
  parameters,
  activeParameter,
  setActiveParameter,
  renderItem,
  handlePressWithDouble,
}: GenericParameterModuleProps<T>) => {
  const { t } = useTranslation();

  const defaultHandlePressWithDouble = useCallback((_param: T, action: () => void) => {
    action();
  }, []);

  const pressHandler = handlePressWithDouble || defaultHandlePressWithDouble;

  const items = useMemo(() => {
    const list: WheelItem<T>[] = [];
    for (const item of parameters) {
      const config: ParameterConfig<T> = typeof item === 'string' ? { id: item } : item;
      if (config.visible === false) {
        continue;
      }
      const labelKey = config.labelKey || `parameters.${config.id}`;
      list.push({
        id: config.id,
        component: renderItem(config.id, t(labelKey)),
      });
    }
    return list;
  }, [parameters, t, renderItem]);

  useEffect(() => {
    if (items.length > 0 && activeParameter !== 'none' as T) {
      const isValid = items.some(item => item.id === activeParameter);
      if (!isValid) {
        setActiveParameter(items[0].id);
      }
    }
  }, [items, activeParameter, setActiveParameter]);

  if (items.length === 0) return null;

  return (
    <Animated.View style={styles.tabContent}>
      <SystemParameterWheel<T>
        items={items}
        activeParameter={activeParameter}
        setActiveParameter={setActiveParameter}
        handlePressWithDouble={pressHandler}
      />
    </Animated.View>
  );
};
GenericParameterModuleImpl.displayName = 'GenericParameterModule';

export const GenericParameterModule = React.memo(GenericParameterModuleImpl) as unknown as <T extends string>(
  props: GenericParameterModuleProps<T>
) => React.ReactElement | null;

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
