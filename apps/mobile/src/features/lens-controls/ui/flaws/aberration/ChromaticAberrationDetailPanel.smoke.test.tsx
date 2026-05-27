import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChromaticAberrationDetailPanel } from './ChromaticAberrationDetailPanel';

const mockSetAberrationDirection = jest.fn();
const mockSetAberrationInvert = jest.fn();
const mockUpdateAberrationDirection = jest.fn();
const mockUpdateAberrationInvert = jest.fn();
let mockIsDebugEnabled = false;
let mockAberrationDirectionVal = 0;
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
      aberrationDirection: { value: mockAberrationDirectionVal },
      setAberrationDirection: mockSetAberrationDirection,
      aberrationInvert: { value: mockAberrationInvertVal },
      setAberrationInvert: mockSetAberrationInvert,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateAberrationDirection: mockUpdateAberrationDirection,
    updateAberrationInvert: mockUpdateAberrationInvert,
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: mockIsDebugEnabled };
    return fn ? fn(state) : state;
  }),
}));

describe('ChromaticAberrationDetailPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDebugEnabled = false;
    mockAberrationDirectionVal = 0;
    mockAberrationInvertVal = false;
  });

  it('renders correctly in default state', () => {
    const { toJSON, getByText } = render(<ChromaticAberrationDetailPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('STD')).toBeTruthy();
    expect(getByText('HOR')).toBeTruthy();
    expect(getByText('RAD')).toBeTruthy();
    expect(getByText('INV')).toBeTruthy();
  });

  it('handles direction changes on STD, HOR, RAD press', () => {
    const { getByText } = render(<ChromaticAberrationDetailPanel />);

    // Press HOR
    fireEvent.press(getByText('HOR'));
    expect(mockSetAberrationDirection).toHaveBeenCalledWith(1);
    expect(mockUpdateAberrationDirection).toHaveBeenCalledWith(1);

    // Press RAD
    fireEvent.press(getByText('RAD'));
    expect(mockSetAberrationDirection).toHaveBeenCalledWith(2);
    expect(mockUpdateAberrationDirection).toHaveBeenCalledWith(2);

    // Press STD
    fireEvent.press(getByText('STD'));
    expect(mockSetAberrationDirection).toHaveBeenCalledWith(0);
    expect(mockUpdateAberrationDirection).toHaveBeenCalledWith(0);
  });

  it('handles invert press', () => {
    mockAberrationInvertVal = false;
    const { getByText } = render(<ChromaticAberrationDetailPanel />);

    fireEvent.press(getByText('INV'));
    expect(mockSetAberrationInvert).toHaveBeenCalledWith(true);
    expect(mockUpdateAberrationInvert).toHaveBeenCalledWith(true);
  });

  it('handles invert press when already inverted', () => {
    mockAberrationInvertVal = true;
    const { getByText } = render(<ChromaticAberrationDetailPanel />);

    fireEvent.press(getByText('INV'));
    expect(mockSetAberrationInvert).toHaveBeenCalledWith(false);
    expect(mockUpdateAberrationInvert).toHaveBeenCalledWith(false);
  });

  it('applies debug styles when isDebugEnabled is true', () => {
    mockIsDebugEnabled = true;
    const { toJSON } = render(<ChromaticAberrationDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});

