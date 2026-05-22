import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Image } from 'react-native';
import { ParameterExtensions } from './ParameterExtensions';
import { useSystemStore } from '@entities/system';
import { useBodyStore } from '@entities/body';

describe('ParameterExtensions', () => {
  const mockTranslateY = { value: 0 } as unknown as import('react-native-reanimated').SharedValue<number>;

  it('renders nothing when activeParameter is none', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('none');
    });
    const { toJSON } = render(<ParameterExtensions translateY={mockTranslateY} />);
    expect(toJSON()).toBeNull();
  });

  it('renders grain sub-parameters when activeParameter is grain', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('grain');
    });
    const { getByText } = render(<ParameterExtensions translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.CHROMA')).toBeDefined();
    expect(getByText('PARAMETERS.SIZE')).toBeDefined();
  });

  it('renders torch sub-parameters when activeParameter is torch', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('torch');
    });
    const { getByText } = render(<ParameterExtensions translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.TORCH_DIMMER')).toBeDefined();
  });

  it('renders chromatic aberration sub-parameters when activeParameter is chromatic_aberration', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('chromatic_aberration');
    });
    const { getByText } = render(<ParameterExtensions translateY={mockTranslateY} />);
    expect(getByText('PARAMETERS.DIRECTION')).toBeDefined();
  });

  it('renders language sub-parameters when activeParameter is language', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('language');
    });
    const { UNSAFE_getAllByType } = render(<ParameterExtensions translateY={mockTranslateY} />);
    const images = UNSAFE_getAllByType(Image);
    expect(images.length).toBe(2);
  });

  it('renders resolution settings and conditionally renders 4K preview warning and toggle', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 1; // 1080p
    });

    const { getByText, queryByText } = render(<ParameterExtensions translateY={mockTranslateY} />);
    expect(getByText('1080p')).toBeDefined();
    expect(queryByText('PARAMETERS.PREVIEW_IN_4K')).toBeNull();
    expect(queryByText('parameters.preview_in_4k_warning')).toBeNull();
  });

  it('renders 4K preview toggle and warning when resolution is set to 4K', () => {
    act(() => {
      useSystemStore.getState().setActiveParameter('resolution_setting');
      useBodyStore.getState().resolutionSetting.value = 0; // 4K
    });

    const { getByText } = render(<ParameterExtensions translateY={mockTranslateY} />);
    expect(getByText('4K')).toBeDefined();
    expect(getByText('PARAMETERS.PREVIEW_IN_4K')).toBeDefined();
    expect(getByText('parameters.preview_in_4k_warning')).toBeDefined();
  });
});
