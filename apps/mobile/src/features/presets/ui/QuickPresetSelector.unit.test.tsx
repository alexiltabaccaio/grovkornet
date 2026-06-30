import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickPresetSelector } from './QuickPresetSelector';
import { usePresetStore } from '@entities/preset';
import { useControlPanelStore } from '@entities/system';
import * as Haptics from 'expo-haptics';

import { nextQuickPreset, prevQuickPreset, generateQuickSelectList } from '../lib/presetActions';

jest.mock('../lib/presetActions', () => ({
  nextQuickPreset: jest.fn(),
  prevQuickPreset: jest.fn(),
  generateQuickSelectList: jest.fn(),
}));

describe('QuickPresetSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      activePresetId: 'default',
    });

    useControlPanelStore.setState({
      activeParameter: 'none',
    });
  });

  it('renders default preset name and disables arrows when quick select list is single item', () => {
    (generateQuickSelectList as jest.Mock).mockReturnValue([{ id: 'default', name: 'Default' }]);

    const { getByText, getByLabelText } = render(<QuickPresetSelector />);

    expect(getByText('presets.default')).toBeTruthy();
    expect(getByLabelText('Previous preset').props.accessibilityState?.disabled).toBe(true);
    expect(getByLabelText('Next preset').props.accessibilityState?.disabled).toBe(true);
  });

  it('renders enabled chevron arrows and navigates when quick list has multiple items', () => {
    (generateQuickSelectList as jest.Mock).mockReturnValue([
      { id: 'default', name: 'Default' },
      { id: 'customized', name: 'Custom' },
    ]);

    const { getByText, getByLabelText } = render(<QuickPresetSelector />);

    expect(getByText('presets.default')).toBeTruthy();
    const prevBtn = getByLabelText('Previous preset');
    const nextBtn = getByLabelText('Next preset');

    expect(prevBtn.props.accessibilityState?.disabled).toBeFalsy();
    expect(nextBtn.props.accessibilityState?.disabled).toBeFalsy();

    fireEvent.press(prevBtn);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(prevQuickPreset).toHaveBeenCalled();

    fireEvent.press(nextBtn);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(nextQuickPreset).toHaveBeenCalled();
  });

  it('applies correct preset text colors based on activePresetId', () => {
    // 1. Customized color
    usePresetStore.setState({ activePresetId: 'customized' });
    (generateQuickSelectList as jest.Mock).mockReturnValue([
      { id: 'customized', name: 'Custom' },
    ]);
    const { getByText, rerender } = render(<QuickPresetSelector />);
    expect(getByText('presets.customized').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FFF' })])
    );

    // 2. Custom user preset color
    usePresetStore.setState({ activePresetId: 'user-1' });
    (generateQuickSelectList as jest.Mock).mockReturnValue([
      { id: 'user-1', name: 'UserPreset1' },
    ]);
    rerender(<QuickPresetSelector />);
    expect(getByText('UserPreset1').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FFF' })])
    );
  });
});
