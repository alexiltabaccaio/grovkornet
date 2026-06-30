import React, { memo } from 'react';
import { WheelSelector, GenericWheelItem } from '../wheel/WheelSelector';

interface SystemParameterWheelProps<T extends string = string> {
  items: GenericWheelItem<T>[];
  activeParameter: T;
  setActiveParameter: (param: T) => void;
  handlePressWithDouble?: (param: T, action: () => void) => void;
}

const SystemParameterWheelImpl = <T extends string>({
  items,
  activeParameter,
  setActiveParameter,
  handlePressWithDouble,
}: SystemParameterWheelProps<T>) => {
  return (
    <WheelSelector
      items={items}
      activeId={activeParameter}
      onChangeActiveId={setActiveParameter}
      handlePressWithDouble={handlePressWithDouble}
    />
  );
};
SystemParameterWheelImpl.displayName = 'SystemParameterWheel';

export const SystemParameterWheel = memo(SystemParameterWheelImpl) as unknown as <T extends string>(
  props: SystemParameterWheelProps<T>
) => React.ReactElement | null;
export type { GenericWheelItem as WheelItem };
