import React, { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useControlPanelStore, ParameterType } from '@entities/system';
import { WheelSelector, GenericWheelItem } from '@shared/ui/wheel/WheelSelector';

interface SystemParameterWheelProps {
  items: GenericWheelItem<ParameterType>[];
  handlePressWithDouble?: (param: ParameterType, action: () => void) => void;
}

export const SystemParameterWheel = memo(({
  items,
  handlePressWithDouble,
}: SystemParameterWheelProps) => {
  const { activeParameter, setActiveParameter } = useControlPanelStore(
    useShallow((s) => ({
      activeParameter: s.activeParameter,
      setActiveParameter: s.setActiveParameter,
    }))
  );

  return (
    <WheelSelector
      items={items}
      activeId={activeParameter}
      onChangeActiveId={setActiveParameter}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
});

SystemParameterWheel.displayName = 'SystemParameterWheel';
export type { GenericWheelItem as WheelItem };
