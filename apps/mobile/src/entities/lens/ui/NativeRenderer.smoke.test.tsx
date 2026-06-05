/* eslint-disable @typescript-eslint/no-require-imports */
import React, { createRef } from 'react';
import { render } from '@testing-library/react-native';
import { NativeRenderer, NativeRendererRef } from './NativeRenderer';

const mockTakePhoto = jest.fn();
const mockGetNativeElementTakePhoto = jest.fn();
let mockHasDirectTakePhoto = true;

jest.mock('expo-modules-core', () => {
  const actual = jest.requireActual('expo-modules-core');
  const React = require('react');

  class MockNativeFilmCamera extends React.Component<any> {
    get takePhoto() {
      return mockHasDirectTakePhoto ? mockTakePhoto : undefined;
    }
    getNativeElement = jest.fn(() => ({
      takePhoto: mockGetNativeElementTakePhoto,
    }));
    render() {
      const { View } = require('react-native');
      return <View {...this.props} />;
    }
  }

  return {
    ...actual,
    requireNativeViewManager: jest.fn(() => MockNativeFilmCamera),
    requireNativeModule: jest.fn(() => ({
      verifyGrovkornetAuthenticity: jest.fn(() => Promise.resolve(true)),
    })),
  };
});

describe('NativeRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasDirectTakePhoto = true;
  });

  it('renders without crashing', () => {
    const mockProps = {
      secureViewEnabled: true,
    };

    const { toJSON } = render(<NativeRenderer {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('calls takePhoto directly when nativeView.takePhoto is present', () => {
    const ref = createRef<NativeRendererRef>();
    render(<NativeRenderer ref={ref} />);

    expect(ref.current).toBeDefined();
    ref.current?.takePhoto();

    expect(mockTakePhoto).toHaveBeenCalled();
    expect(mockGetNativeElementTakePhoto).not.toHaveBeenCalled();
  });

  it('calls getNativeElement().takePhoto when nativeView.takePhoto is not present', () => {
    mockHasDirectTakePhoto = false;
    const ref = createRef<NativeRendererRef>();
    render(<NativeRenderer contrast={1} ref={ref} />);

    expect(ref.current).toBeDefined();
    ref.current?.takePhoto();

    expect(mockTakePhoto).not.toHaveBeenCalled();
    expect(mockGetNativeElementTakePhoto).toHaveBeenCalled();
  });
});


