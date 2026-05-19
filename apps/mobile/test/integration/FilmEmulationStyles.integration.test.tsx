/* eslint-disable @typescript-eslint/no-require-imports */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera/ui/CameraScreen';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { DEFAULT_GRAIN_INTENSITY } from '@shared/constants/videoProcessing';

// Mock ConnectedFilmCamera to avoid native issues during integration test
jest.mock('@features/camera-controls', () => {
  const actual = jest.requireActual<{ ConnectedFilmCamera: unknown }>('@features/camera-controls');
  const { View } = require('react-native') as typeof import('react-native');
  return {
    ...actual,
    ConnectedFilmCamera: (_props: unknown) => <View testID="connected-camera" />,
  };
});

describe('FilmEmulationStyles Integration', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.getState().setActiveSection('none');
      useUIStore.getState().setActiveModule('none');
      useStylesStore.getState().resetEffect('grain');
      useStylesStore.getState().resetEffect('chromatic_aberration');
    });
  });

  it('navigates to Film section and synchronizes grain styles correctly', async () => {
    const { getByLabelText, getByText, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Click on Film section in Footer
    const filmSection = getByLabelText(/sections\.film/i) as unknown as { props: unknown };
    expect(filmSection).toBeDefined();

    act(() => {
      fireEvent.press(filmSection);
    });

    // Verify UI Store updated to film section
    expect(useUIStore.getState().activeSection).toBe('film');

    // Adjust grain intensity and verify grainEnabled toggles automatically
    act(() => {
      useStylesStore.getState().setGrainIntensity(0.75);
    });

    expect(useStylesStore.getState().grainIntensity.value).toBe(0.75);
    expect(useStylesStore.getState().grainEnabled.value).toBe(true);

    // Reset effect and verify it returns to default
    act(() => {
      useStylesStore.getState().resetEffect('grain');
    });

    expect(useStylesStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(useStylesStore.getState().grainEnabled.value).toBe(false);
  });
});
