/* eslint-disable @typescript-eslint/unbound-method */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LanguagePanel } from './LanguagePanel';
import { logger } from '@shared/lib/logger';

const mockChangeLanguage = jest.fn().mockImplementation(() => Promise.resolve());
let mockLanguage = 'en';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: mockChangeLanguage,
      get language() {
        return mockLanguage;
      },
    },
  }),
}));

const mockSetActiveDetailPanel = jest.fn();
let mockActiveDetailPanel = 'lang_en';

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn(),
  useControlPanelStore: jest.fn((fn?: (state: any) => any) => {
    const state = {
      activeDetailPanel: mockActiveDetailPanel,
      setActiveDetailPanel: mockSetActiveDetailPanel,
    };
    return fn ? fn(state) : state;
  }),
  ParameterControl: 'ParameterControl',
  ParameterPanelWrapper: 'ParameterPanelWrapper',
}));

jest.mock('@shared/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('LanguagePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLanguage = 'en';
    mockActiveDetailPanel = 'lang_en';
    mockChangeLanguage.mockImplementation(() => Promise.resolve());
  });

  it('renders correctly', () => {
    const { toJSON, UNSAFE_root } = render(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    expect(toJSON()).toBeDefined();
    
    const controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    expect(controls).toHaveLength(2);
  });

  it('handles English flag selection correctly', () => {
    const { UNSAFE_root } = render(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    const controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    
    // Press English control
    fireEvent.press(controls[0]);
    
    expect(mockSetActiveDetailPanel).toHaveBeenCalledWith('lang_en');
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('handles Italian flag selection correctly', () => {
    const { UNSAFE_root } = render(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    const controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    
    // Press Italian control
    fireEvent.press(controls[1]);
    
    expect(mockSetActiveDetailPanel).toHaveBeenCalledWith('lang_it');
    expect(mockChangeLanguage).toHaveBeenCalledWith('it');
  });

  it('logs error when changing language to English fails', async () => {
    const testError = new Error('Boring connection error');
    mockChangeLanguage.mockRejectedValueOnce(testError);

    const { UNSAFE_root } = render(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    const controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    
    fireEvent.press(controls[0]);
    
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'LanguagePanel',
        'Failed to change language to en',
        testError
      );
    });
  });

  it('logs error when changing language to Italian fails', async () => {
    const testError = new Error('Boring connection error');
    mockChangeLanguage.mockRejectedValueOnce(testError);

    const { UNSAFE_root } = render(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    const controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    
    fireEvent.press(controls[1]);
    
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'LanguagePanel',
        'Failed to change language to it',
        testError
      );
    });
  });

  it('correctly determines isActive for English and Italian flag based on system store and i18n language', () => {
    // Both English
    mockLanguage = 'en';
    mockActiveDetailPanel = 'lang_en';
    let { UNSAFE_root, rerender } = render(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    let controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    expect(controls[0].props.isActive).toBe(true);
    expect(controls[1].props.isActive).toBe(false);

    // Active detail panel Italian, language English
    mockLanguage = 'en';
    mockActiveDetailPanel = 'lang_it';
    rerender(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    expect(controls[0].props.isActive).toBe(true); // true because language is en
    expect(controls[1].props.isActive).toBe(true); // true because activeDetailPanel is lang_it

    // Active detail panel English, language Italian
    mockLanguage = 'it';
    mockActiveDetailPanel = 'lang_en';
    rerender(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    expect(controls[0].props.isActive).toBe(true); // true because activeDetailPanel is lang_en
    expect(controls[1].props.isActive).toBe(true); // true because language is it

    // Both Italian
    mockLanguage = 'it';
    mockActiveDetailPanel = 'lang_it';
    rerender(<LanguagePanel animatedStyle={{ opacity: 1 }} />);
    controls = UNSAFE_root.findAllByType('ParameterControl' as any);
    expect(controls[0].props.isActive).toBe(false);
    expect(controls[1].props.isActive).toBe(true);
  });
});
