import React from 'react';
import { render } from '@testing-library/react-native';
import { WheelItemComponent } from './WheelItemComponent';
import { Text } from 'react-native';
import { makeMutable } from 'react-native-reanimated';

const mockItem = {
  id: 'saturation' as const,
  component: <Text>Saturation</Text>,
};

describe('WheelItemComponent', () => {
  it('renders correctly', () => {
    const dragX = makeMutable(0);
    const { toJSON, getByText } = render(
      <WheelItemComponent
        item={mockItem}
        index={0}
        dragX={dragX}
        virtualItemsLength={1}
        handlePressWithDouble={jest.fn()}
        setActiveParameter={jest.fn()}
        updateState={jest.fn()}
      />
    );
    expect(toJSON()).toBeDefined();
    expect(getByText('Saturation')).toBeTruthy();
  });
});
