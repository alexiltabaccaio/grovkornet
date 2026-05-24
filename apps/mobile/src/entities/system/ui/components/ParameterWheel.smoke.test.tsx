/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { View } from 'react-native';
import { ParameterWheel, WheelItem } from './ParameterWheel';

// Variables to capture gesture callbacks
let panStart: (() => void) | undefined;
let panUpdate: ((event: any) => void) | undefined;
let panEnd: ((event: any) => void) | undefined;

jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      ...actual.Gesture,
      Pan: () => {
        const pan: any = {
          activeOffsetX: jest.fn(() => pan),
          failOffsetY: jest.fn(() => pan),
          onStart: jest.fn((cb) => { panStart = cb; return pan; }),
          onUpdate: jest.fn((cb) => { panUpdate = cb; return pan; }),
          onEnd: jest.fn((cb) => { panEnd = cb; return pan; }),
        };
        return pan;
      },
    },
  };
});

// Variables to capture reaction callbacks
let reactionPrepare: (() => number) | undefined;
let reactionReact: ((cur: number, prev: number | null) => void) | undefined;

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    useSharedValue: (v: any) => require('react').useMemo(() => ({ value: v }), []),
    useAnimatedStyle: (cb: any) => cb(),
    withTiming: jest.fn((target, config, callback) => {
      if (callback) {
        callback(true);
      }
      return target;
    }),
    runOnJS: jest.fn((f: any) => f),
    useAnimatedReaction: jest.fn((prepare, react) => {
      reactionPrepare = prepare;
      reactionReact = react;
    }),
    interpolate: jest.fn((v, _i, _o) => v),
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

describe('ParameterWheel Component', () => {
  const mockItems: WheelItem[] = [
    { id: 'focus', component: <View testID="focus-comp" /> },
    { id: 'iso', component: <View testID="iso-comp" /> },
  ];
  
  const mockSetActiveParameter = jest.fn();
  const mockHandlePressWithDouble = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    panStart = undefined;
    panUpdate = undefined;
    panEnd = undefined;
    reactionPrepare = undefined;
    reactionReact = undefined;
  });

  it('renders null when items list is empty', () => {
    const { toJSON } = render(
      <ParameterWheel
        items={[]}
        activeParameter="none"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders items and handles press/double press logic', () => {
    const { getAllByTestId } = render(
      <ParameterWheel
        items={mockItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    const focusComp = getAllByTestId('focus-comp')[0];
    fireEvent.press(focusComp);
    
    expect(mockHandlePressWithDouble).toHaveBeenCalledWith('focus', expect.any(Function));
    
    const doublePressCallback = mockHandlePressWithDouble.mock.calls[0][1];
    doublePressCallback();
    expect(mockSetActiveParameter).toHaveBeenCalledWith('focus');
  });

  it('handles tap on a non-centered item to animate and center it', () => {
    const { getAllByTestId } = render(
      <ParameterWheel
        items={mockItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );
    const isoCompsAll = getAllByTestId('iso-comp');
    fireEvent.press(isoCompsAll[0]);
    expect(mockHandlePressWithDouble).not.toHaveBeenCalled();
  });

  it('handles item custom onPress if defined', () => {
    const mockOnPress = jest.fn();
    const itemsWithOnPress: WheelItem[] = [
      { id: 'focus', component: <View testID="focus-comp" />, onPress: mockOnPress },
      { id: 'iso', component: <View testID="iso-comp" /> },
    ];

    const { getAllByTestId } = render(
      <ParameterWheel
        items={itemsWithOnPress}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    fireEvent.press(getAllByTestId('focus-comp')[0]);
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('handles external changes of activeParameter to scroll the wheel', () => {
    const { rerender } = render(
      <ParameterWheel
        items={mockItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    rerender(
      <ParameterWheel
        items={mockItems}
        activeParameter="iso"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    rerender(
      <ParameterWheel
        items={mockItems}
        activeParameter="none"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );
  });

  it('handles pan gestures and adjusts dragX target', () => {
    render(
      <ParameterWheel
        items={mockItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    expect(panStart).toBeDefined();
    expect(panUpdate).toBeDefined();
    expect(panEnd).toBeDefined();

    act(() => {
      panStart!();
      panUpdate!({ translationX: -50 });
      panEnd!({ velocityX: -500 });
    });

    act(() => {
      panStart!();
      panUpdate!({ translationX: 50 });
      panEnd!({ velocityX: 500 });
    });
    
    act(() => {
      panStart!();
      panUpdate!({ translationX: 5 });
      panEnd!({ velocityX: 10 });
    });
  });

  it('updates state via animated reaction', () => {
    render(
      <ParameterWheel
        items={mockItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    expect(reactionPrepare).toBeDefined();
    expect(reactionReact).toBeDefined();

    const prepResult = reactionPrepare!();
    expect(typeof prepResult).toBe('number');

    act(() => {
      reactionReact!(1, 0);
    });
    expect(mockSetActiveParameter).toHaveBeenCalledWith('iso');
  });

  it('handles items list of length 1 (no virtualization and return early on gesture)', () => {
    const singleItem: WheelItem[] = [{ id: 'focus', component: <View testID="focus-comp" /> }];
    render(
      <ParameterWheel
        items={singleItem}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );
    act(() => {
      panStart!();
      panUpdate!({ translationX: 10 });
      panEnd!({ velocityX: 100 });
    });
  });

  it('covers wrap-around calculations for larger item list', () => {
    const largeItems: WheelItem[] = [
      { id: 'focus', component: <View /> },
      { id: 'iso', component: <View /> },
      { id: 'shutter_speed', component: <View /> },
      { id: 'temperature', component: <View /> },
      { id: 'contrast', component: <View /> },
      { id: 'saturation', component: <View /> },
    ];

    const { rerender } = render(
      <ParameterWheel
        items={largeItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    rerender(
      <ParameterWheel
        items={largeItems}
        activeParameter="saturation"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    rerender(
      <ParameterWheel
        items={largeItems}
        activeParameter="focus"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );
  });

  it('covers tap wrap-around calculations in WheelItemComponent', () => {
    const largeItems: WheelItem[] = [
      { id: 'focus', component: <View testID="focus-comp" /> },
      { id: 'iso', component: <View /> },
      { id: 'shutter_speed', component: <View /> },
      { id: 'temperature', component: <View /> },
      { id: 'contrast', component: <View /> },
      { id: 'saturation', component: <View testID="saturation-comp" /> },
    ];

    const { getAllByTestId } = render(
      <ParameterWheel
        items={largeItems}
        activeParameter="saturation"
        setActiveParameter={mockSetActiveParameter}
        handlePressWithDouble={mockHandlePressWithDouble}
      />
    );

    // Tapping focus-comp at index 0 when centered at saturation (index 5)
    // index = 0, normalizedCurrent = 5. diff = -5 < -3. diff += 6.
    fireEvent.press(getAllByTestId('focus-comp')[0]);
  });
});
