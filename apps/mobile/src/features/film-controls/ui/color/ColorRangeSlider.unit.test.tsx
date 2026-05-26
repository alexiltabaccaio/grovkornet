import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { ColorRangeSlider } from './ColorRangeSlider';

jest.mock('@entities/film', () => {
  const mockSetters = {
    setSatRed: jest.fn(),
    setSatOrange: jest.fn(),
  };

  const mockWorklets = {
    updateSatRed: jest.fn(),
    updateSatOrange: jest.fn(),
    updateBoundRedOrange: jest.fn(),
    updateBoundOrangeYellow: jest.fn(),
  };

  return {
    useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
      const state = {
        satRed: 50.0,
        setSatRed: mockSetters.setSatRed,
        satOrange: 50.0,
        setSatOrange: mockSetters.setSatOrange,
        boundMagentaRed: { value: 350.0 },
        boundRedOrange: { value: 45.0 },
        boundOrangeYellow: { value: 80.0 },
        boundYellowGreen: { value: 125.0 },
        boundGreenCyan: { value: 170.0 },
        boundCyanBlue: { value: 230.0 },
        boundBluePurple: { value: 280.0 },
        boundPurpleMagenta: { value: 315.0 },
      };
      return fn ? fn(state) : state;
    }),
    useFilmWorklets: () => mockWorklets,
  };
});

describe('ColorRangeSlider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and initializes trackWidth with the calculated screen width minus offset', () => {
    const screenWidth = Dimensions.get('window').width;
    const expectedInitialWidth = screenWidth - 188;

    const { toJSON } = render(<ColorRangeSlider activeColorIndex={1} />);
    expect(toJSON()).toBeDefined();

    // Verify useSharedValue was called with the correct initial track width
    expect(useSharedValue).toHaveBeenCalledWith(expectedInitialWidth);

    // Retrieve the first shared value object which is trackWidth
    const trackWidthMockObj = (useSharedValue as jest.Mock).mock.results[0].value;
    expect(trackWidthMockObj.value).toBe(expectedInitialWidth);
  });

  it('updates trackWidth value on layout event', () => {
    const { getByTestId } = render(<ColorRangeSlider activeColorIndex={1} />);
    const track = getByTestId('color-range-slider-track');
    
    const trackWidthMockObj = (useSharedValue as jest.Mock).mock.results[0].value;
    
    // Fire layout event to simulate device measurements
    fireEvent(track, 'layout', {
      nativeEvent: {
        layout: {
          width: 350,
        },
      },
    });
    
    expect(trackWidthMockObj.value).toBe(350);
  });
});
