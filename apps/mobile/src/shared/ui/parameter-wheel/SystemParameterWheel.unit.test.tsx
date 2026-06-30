/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { SystemParameterWheel } from './SystemParameterWheel';
import { InteractionContext } from '@shared/lib';

jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      ...actual.Gesture,
      Pan: () => {
        const pan: any = {
          enabled: jest.fn(() => pan),
          activeOffsetX: jest.fn(() => pan),
          failOffsetY: jest.fn(() => pan),
          onStart: jest.fn(() => pan),
          onUpdate: jest.fn(() => pan),
          onEnd: jest.fn(() => pan),
        };
        return pan;
      },
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    useSharedValue: (v: any) => require('react').useMemo(() => ({ value: v }), []),
    useAnimatedStyle: (cb: any) => cb(),
    withTiming: jest.fn((target) => target),
    runOnJS: jest.fn((f: any) => f),
    useAnimatedReaction: jest.fn(),
    interpolate: jest.fn((v) => v),
    Extrapolation: {
      CLAMP: 'clamp',
    },
    View,
    default: {
      View,
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
  };
});

describe('SystemParameterWheel Component', () => {
  const mockItems = [
    { id: 'focus', component: <View testID="focus-comp" /> },
    { id: 'iso', component: <View testID="iso-comp" /> },
  ];

  it('renders and calls setActiveParameter when selecting an item', () => {
    const mockSetActiveParameter = jest.fn();
    const { getAllByTestId } = render(
      <InteractionContext.Provider value={{ isInteractable: true }}>
        <SystemParameterWheel
          items={mockItems}
          activeParameter="focus"
          setActiveParameter={mockSetActiveParameter}
        />
      </InteractionContext.Provider>
    );

    const isoComp = getAllByTestId('iso-comp')[0];
    fireEvent.press(isoComp);

    expect(mockSetActiveParameter).toHaveBeenCalledWith('iso');
  });
});
