import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PresetsModule } from './PresetsModule';
import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useSystemStore } from '@entities/system';

import { applyPreset } from '../../lib/presetActions';

jest.mock('../../lib/presetActions', () => ({
  applyPreset: jest.fn(),
}));

describe('PresetsModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      activePresetId: 'default',
      customizedPayload: null,
      userPresets: [],
    });

    useSystemStore.setState({
      activeParameter: 'none',
    });
  });

  it('renders active Default button and clickable user presets', () => {
    const presets = [
      {
        id: 'user-1',
        name: 'MyPreset',
        payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
        isFavorite: false,
        inQuickSelect: false,
        createdAt: Date.now(),
      },
    ];

    usePresetStore.setState({
      activePresetId: 'default',
      userPresets: presets,
      customizedPayload: null,
    });

    const { getByText, queryByText } = render(<PresetsModule />);

    expect(getByText('PRESETS.DEFAULT')).toBeTruthy();
    expect(queryByText('PRESETS.CUSTOMIZED')).toBeNull();
    
    const userBtn = getByText('MYPRESET');
    expect(userBtn).toBeTruthy();

    fireEvent.press(userBtn);
    expect(applyPreset).toHaveBeenCalledWith('user-1');
    expect(useSystemStore.getState().activeParameter).toBe('presets');
  });

  it('renders Personalizzato button if customizedPayload is not null', () => {
    usePresetStore.setState({
      activePresetId: 'customized',
      customizedPayload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
    });

    const { getByText } = render(<PresetsModule />);
    
    const customizedBtn = getByText('PRESETS.CUSTOMIZED');
    expect(customizedBtn).toBeTruthy();

    fireEvent.press(customizedBtn);
    expect(applyPreset).toHaveBeenCalledWith('customized');
  });
});
