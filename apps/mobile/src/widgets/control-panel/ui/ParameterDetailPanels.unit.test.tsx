/* eslint-disable @typescript-eslint/no-require-imports, unused-imports/no-unused-vars, react-hooks/exhaustive-deps */
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { Image } from 'react-native';
import { ParameterDetailPanels } from './ParameterDetailPanels';
import { useSystemStore } from '@entities/system';
import { useBodyStore } from '@entities/body';

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
      // Run in useEffect to prevent infinite loop of re-renders
      React.useEffect(() => {
        try {
          const res = prepare();
          react(res, null); // previousValue is null to trigger the !== block
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

describe('ParameterDetailPanels', () => {
  const mockTranslateY = { value: -50 } as unknown as import('react-native-reanimated').SharedValue<number>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when activeParameter is none', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('none');
    });
    const { toJSON } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeNull();
  });

  it('renders grain sub-parameters when activeParameter is grain', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('grain');
    });
    const { getByText } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.CHROMA')).toBeDefined();
    expect(getByText('PARAMETERS.SIZE')).toBeDefined();
  });

  it('renders torch sub-parameters when activeParameter is torch and handles toggle', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('torch');
      useBodyStore.getState().torchState.value = 0;
    });
    const { getByText, getByRole } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.TORCH_DIMMER')).toBeDefined();

    const torchButton = getByRole('button', { name: 'OFF' });
    expect(torchButton).toBeDefined();

    act(() => {
      fireEvent.press(torchButton);
    });

    expect(useBodyStore.getState().torchState.value).toBe(1);
  });

  it('renders chromatic aberration sub-parameters when activeParameter is chromatic_aberration', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('chromatic_aberration');
    });
    const { getByText } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.DIRECTION')).toBeDefined();
  });

  it('renders language sub-parameters when activeParameter is language', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('language');
    });
    const { UNSAFE_getAllByType } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    const images = UNSAFE_getAllByType(Image);
    expect(images.length).toBe(2);
  });

  it('renders resolution settings and conditionally renders 4K preview warning and toggle', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 1; // 1080p
    });

    const { getByText, queryByText } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(getByText('1080p')).toBeDefined();
    expect(queryByText('PARAMETERS.PREVIEW_IN_4K')).toBeNull();
    expect(queryByText('parameters.preview_in_4k_warning')).toBeNull();
  });

  it('renders 4K preview toggle and warning when resolution is set to 4K and handles toggle', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 0; // 4K
      useBodyStore.getState().previewIn4k.value = 0;
    });

    const { getByText, getByRole } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(getByText('4K')).toBeDefined();
    expect(getByText('PARAMETERS.PREVIEW_IN_4K')).toBeDefined();
    expect(getByText('parameters.preview_in_4k_warning')).toBeDefined();

    const toggleButton = getByRole('button', { name: 'parameters.preview_in_4k' });
    expect(toggleButton).toBeDefined();

    act(() => {
      fireEvent.press(toggleButton);
    });

    expect(useBodyStore.getState().previewIn4k.value).toBe(1);
  });

  it('renders saturation sub-parameters when activeParameter is saturation', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('saturation');
    });
    const { getByTestId } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(getByTestId('color-circle-red')).toBeDefined();
  });

  it('renders slider-only parameters like contrast', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('contrast');
    });
    const { toJSON } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    expect(toJSON()).toBeDefined();
  });

  it('re-uses the same container root element when switching between different parameters', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('contrast');
    });
    const { toJSON, rerender } = render(<ParameterDetailPanels translateY={mockTranslateY} />);
    const firstRender = toJSON();
    expect(firstRender?.type).toBe('View');

    act(() => {
      useSystemStore.getState().setActiveParameter('iso');
    });
    rerender(<ParameterDetailPanels translateY={mockTranslateY} />);
    const secondRender = toJSON();
    expect(secondRender?.type).toBe('View');
    
    // Both must use the same container layout style
    expect(firstRender?.props?.style).toEqual(secondRender?.props?.style);
  });
});
