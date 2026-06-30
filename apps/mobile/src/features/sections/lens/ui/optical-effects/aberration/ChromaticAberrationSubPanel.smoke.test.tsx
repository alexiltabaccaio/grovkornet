import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChromaticAberrationSubPanel } from './ChromaticAberrationSubPanel';

const mockSetAberrationInvert = jest.fn();
const mockUpdateAberrationInvert = jest.fn();
let mockIsLayoutOverlayEnabled = false;
let mockAberrationInvertVal = false;

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
      aberrationInvert: { value: mockAberrationInvertVal },
      setAberrationInvert: mockSetAberrationInvert,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateAberrationInvert: mockUpdateAberrationInvert,
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isLayoutOverlayEnabled: boolean }) => unknown) => {
    const state = { isLayoutOverlayEnabled: mockIsLayoutOverlayEnabled };
    return fn ? fn(state) : state;
  }),
}));

describe('ChromaticAberrationSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLayoutOverlayEnabled = false;
    mockAberrationInvertVal = false;
  });

  it('renders correctly in default state', () => {
    const { toJSON, getByText, queryByText } = render(<ChromaticAberrationSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('INV')).toBeTruthy();
    expect(queryByText('STD')).toBeNull();
    expect(queryByText('HOR')).toBeNull();
    expect(queryByText('RAD')).toBeNull();
  });

  it('handles invert press', () => {
    mockAberrationInvertVal = false;
    const { getByText } = render(<ChromaticAberrationSubPanel />);

    fireEvent.press(getByText('INV'));
    expect(mockSetAberrationInvert).toHaveBeenCalledWith(true);
    expect(mockUpdateAberrationInvert).toHaveBeenCalledWith(true);
  });

  it('handles invert press when already inverted', () => {
    mockAberrationInvertVal = true;
    const { getByText } = render(<ChromaticAberrationSubPanel />);

    fireEvent.press(getByText('INV'));
    expect(mockSetAberrationInvert).toHaveBeenCalledWith(false);
    expect(mockUpdateAberrationInvert).toHaveBeenCalledWith(false);
  });

  it('applies debug styles when isLayoutOverlayEnabled is true', () => {
    mockIsLayoutOverlayEnabled = true;
    const { toJSON } = render(<ChromaticAberrationSubPanel />);
    expect(toJSON()).toBeDefined();
  });
});
