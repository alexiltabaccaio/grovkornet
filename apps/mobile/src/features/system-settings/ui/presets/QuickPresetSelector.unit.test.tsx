import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickPresetSelector } from './QuickPresetSelector';
import { usePresetStore } from '@entities/preset';
import { useSystemStore } from '@entities/system';
import * as Haptics from 'expo-haptics';

describe('QuickPresetSelector', () => {
  const mockNextQuickPreset = jest.fn();
  const mockPrevQuickPreset = jest.fn();
  const mockGetQuickSelectList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      activePresetId: 'default',
      nextQuickPreset: mockNextQuickPreset,
      prevQuickPreset: mockPrevQuickPreset,
      getQuickSelectList: mockGetQuickSelectList,
    });

    useSystemStore.setState({
      activeParameter: 'none',
    });
  });

  it('renders default preset name and hides arrows when quick select list is single item', () => {
    mockGetQuickSelectList.mockReturnValue([{ id: 'default', name: 'Default' }]);

    const { getByText, queryByLabelText } = render(<QuickPresetSelector />);

    expect(getByText('Default')).toBeTruthy();
    expect(queryByLabelText('Previous preset')).toBeNull();
    expect(queryByLabelText('Next preset')).toBeNull();
  });

  it('renders chevron arrows and navigates when quick list has multiple items', () => {
    mockGetQuickSelectList.mockReturnValue([
      { id: 'default', name: 'Default' },
      { id: 'customized', name: 'Personalizzato' },
    ]);

    const { getByText, getByLabelText } = render(<QuickPresetSelector />);

    expect(getByText('Default')).toBeTruthy();
    const prevBtn = getByLabelText('Previous preset');
    const nextBtn = getByLabelText('Next preset');

    fireEvent.press(prevBtn);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(mockPrevQuickPreset).toHaveBeenCalled();

    fireEvent.press(nextBtn);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(mockNextQuickPreset).toHaveBeenCalled();
  });

  it('applies correct preset text colors based on activePresetId', () => {
    // 1. Customized color
    usePresetStore.setState({ activePresetId: 'customized' });
    mockGetQuickSelectList.mockReturnValue([
      { id: 'customized', name: 'Personalizzato' },
    ]);
    const { getByText, rerender } = render(<QuickPresetSelector />);
    expect(getByText('Personalizzato').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FF2D55' })])
    );

    // 2. Custom user preset color
    usePresetStore.setState({ activePresetId: 'user-1' });
    mockGetQuickSelectList.mockReturnValue([
      { id: 'user-1', name: 'UserPreset1' },
    ]);
    rerender(<QuickPresetSelector />);
    expect(getByText('UserPreset1').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FF9500' })])
    );
  });
});
