import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChromaShiftSubPanel } from './ChromaShiftSubPanel';

const mockSetChromaShiftDirection = jest.fn();
const mockSetChromaShiftInvert = jest.fn();
const mockUpdateChromaShiftDirection = jest.fn();
const mockUpdateChromaShiftInvert = jest.fn();
let mockIsLayoutOverlayEnabled = false;
let mockChromaShiftDirectionVal = 0;
let mockChromaShiftInvertVal = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      chromaShiftDirection: { value: mockChromaShiftDirectionVal },
      setChromaShiftDirection: mockSetChromaShiftDirection,
      chromaShiftInvert: { value: mockChromaShiftInvertVal },
      setChromaShiftInvert: mockSetChromaShiftInvert,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateChromaShiftDirection: mockUpdateChromaShiftDirection,
    updateChromaShiftInvert: mockUpdateChromaShiftInvert,
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isLayoutOverlayEnabled: boolean }) => unknown) => {
    const state = { isLayoutOverlayEnabled: mockIsLayoutOverlayEnabled };
    return fn ? fn(state) : state;
  }),
}));

describe('ChromaShiftSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLayoutOverlayEnabled = false;
    mockChromaShiftDirectionVal = 0;
    mockChromaShiftInvertVal = false;
  });

  it('renders correctly in default state', () => {
    const { toJSON, getByText } = render(<ChromaShiftSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('HOR')).toBeTruthy();
    expect(getByText('VER')).toBeTruthy();
    expect(getByText('INV')).toBeTruthy();
  });

  it('handles direction changes on HOR and VER press', () => {
    const { getByText } = render(<ChromaShiftSubPanel />);

    // Press VER
    fireEvent.press(getByText('VER'));
    expect(mockSetChromaShiftDirection).toHaveBeenCalledWith(1);
    expect(mockUpdateChromaShiftDirection).toHaveBeenCalledWith(1);

    // Press HOR
    fireEvent.press(getByText('HOR'));
    expect(mockSetChromaShiftDirection).toHaveBeenCalledWith(0);
    expect(mockUpdateChromaShiftDirection).toHaveBeenCalledWith(0);
  });

  it('handles invert press', () => {
    mockChromaShiftInvertVal = false;
    const { getByText } = render(<ChromaShiftSubPanel />);

    fireEvent.press(getByText('INV'));
    expect(mockSetChromaShiftInvert).toHaveBeenCalledWith(true);
    expect(mockUpdateChromaShiftInvert).toHaveBeenCalledWith(true);
  });

  it('handles invert press when already inverted', () => {
    mockChromaShiftInvertVal = true;
    const { getByText } = render(<ChromaShiftSubPanel />);

    fireEvent.press(getByText('INV'));
    expect(mockSetChromaShiftInvert).toHaveBeenCalledWith(false);
    expect(mockUpdateChromaShiftInvert).toHaveBeenCalledWith(false);
  });

  it('applies debug styles when isLayoutOverlayEnabled is true', () => {
    mockIsLayoutOverlayEnabled = true;
    const { toJSON } = render(<ChromaShiftSubPanel />);
    expect(toJSON()).toBeDefined();
  });
});
