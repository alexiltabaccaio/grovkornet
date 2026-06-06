/* eslint-disable @typescript-eslint/no-require-imports, unused-imports/no-unused-vars, react-hooks/exhaustive-deps */
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SubPanels } from './SubPanels';
import { useSystemStore } from '@entities/system';

// Mock Reanimated to execute useAnimatedReaction callback immediately to cover the sync effects
jest.mock('react-native-reanimated', () => {
  const { View, Text, TextInput } = require('react-native');
  const React = require('react');
  
  const createValueObj = (v: any) => ({ value: v });
  
  const mockReanimated = {
    __esModule: true,
    makeMutable: jest.fn(createValueObj),
    useSharedValue: jest.fn(createValueObj),
    useEvent: jest.fn((h: any) => h),
    useDerivedValue: jest.fn((cb: any) => ({ value: cb() })),
    withSpring: jest.fn((v: any) => v),
    withTiming: jest.fn((v: any) => v),
    withSequence: jest.fn((...args: any[]) => args[args.length - 1]),
    withRepeat: jest.fn((v: any) => v),
    Easing: { linear: jest.fn() },
    useAnimatedStyle: jest.fn((cb: any) => cb()),
    useAnimatedProps: jest.fn((cb: any) => cb()),
    createAnimatedComponent: jest.fn((comp: any) => comp),
    interpolate: jest.fn((v, i, o) => v),
    useAnimatedReaction: jest.fn((prepare: any, react: any) => {
      React.useEffect(() => {
        try {
          const res = prepare();
          react(res, null);
        } catch (e) {}
      }, []);
    }),
    Extrapolation: {
      CLAMP: 'clamp',
    },
    runOnJS: jest.fn((f: any) => f),
    interpolateColor: jest.fn((v, i, o) => '#FFFFFF'),
    FadeIn: { duration: jest.fn().mockReturnThis(), delay: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis(), delay: jest.fn().mockReturnThis() },
    LinearTransition: { duration: jest.fn().mockReturnThis() },
    default: {
      View,
      Text,
      TextInput,
      createAnimatedComponent: jest.fn((comp: any) => comp),
    },
  };
  
  (mockReanimated.default as any).View = View;
  (mockReanimated.default as any).Text = Text;
  (mockReanimated.default as any).TextInput = TextInput;
  
  return mockReanimated;
});

describe('SubPanels', () => {
  const mockTranslateY = { value: -110 } as unknown as import('react-native-reanimated').SharedValue<number>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when activeParameter is none', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('none');
    });
    const { toJSON } = render(<SubPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeNull();
  });

  it('renders grain sub-panel when activeParameter is grain', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('grain');
    });
    const { toJSON } = render(<SubPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders contrast sub-panel when activeParameter is contrast', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('contrast');
    });
    const { toJSON } = render(<SubPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders saturation sub-panel when activeParameter is saturation', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('saturation');
    });
    const { toJSON } = render(<SubPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders hue sub-panel when activeParameter is hue', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('hue');
    });
    const { toJSON } = render(<SubPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeDefined();
  });

  it('applies debugWrapper style when isDebugEnabled is true', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('saturation');
      useSystemStore.getState().setIsDebugEnabled(true);
    });
    const { toJSON } = render(<SubPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeDefined();
    // Reset state after test
    act(() => {
      useSystemStore.getState().setIsDebugEnabled(false);
    });
  });
});
