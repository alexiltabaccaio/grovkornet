import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SubParameterPanel } from './SubParameterPanel';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

describe('SubParameterPanel', () => {
  const mockTranslateY = { value: 0 } as unknown as import('react-native-reanimated').SharedValue<number>;

  it('renders nothing when activeParameter is none', () => {
    act(() => {
      useUIStore.getState().setActiveParameter('none');
    });
    const { toJSON } = render(<SubParameterPanel translateY={mockTranslateY} />);
    expect(toJSON()).toBeNull();
  });

  it('renders grain sub-parameters when activeParameter is grain', () => {
    act(() => {
      useUIStore.getState().setActiveParameter('grain');
    });
    const { getByText } = render(<SubParameterPanel translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.CHROMA')).toBeDefined();
    expect(getByText('PARAMETERS.SIZE')).toBeDefined();
  });

  it('renders torch sub-parameters when activeParameter is torch', () => {
    act(() => {
      useUIStore.getState().setActiveParameter('torch');
    });
    const { getByText } = render(<SubParameterPanel translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.TORCH_DIMMER')).toBeDefined();
  });

  it('renders chromatic aberration sub-parameters when activeParameter is chromatic_aberration', () => {
    act(() => {
      useUIStore.getState().setActiveParameter('chromatic_aberration');
    });
    const { getByText } = render(<SubParameterPanel translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.DIRECTION')).toBeDefined();
  });

  it('renders language sub-parameters when activeParameter is language', () => {
    act(() => {
      useUIStore.getState().setActiveParameter('language');
    });
    const { getByText } = render(<SubParameterPanel translateY={mockTranslateY} />);
    expect(getByText('ENGLISH')).toBeDefined();
    expect(getByText('ITALIANO')).toBeDefined();
  });
});
