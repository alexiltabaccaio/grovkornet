/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CameraScreen } from '@screens/camera';
import { useSystemStore } from '@entities/system';
import { useFilmStore } from '@entities/film';
import { DEFAULT_GRAIN_INTENSITY } from '@grovkornet/shared';

// Mock Viewfinder to avoid native issues during integration test
jest.mock('@widgets/viewfinder', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Viewfinder: (_props: unknown) => <View testID="connected-camera" />,
  };
});

describe('FilmEmulationStyles Integration', () => {
  beforeEach(() => {
    act(() => {
      useSystemStore.getState().setActiveSection('none');
      useSystemStore.getState().setActiveModule('none');
      useFilmStore.getState().resetEffect('grain');
      useFilmStore.getState().resetEffect('chromatic_aberration');
    });
  });

  it('navigates to Film section and synchronizes grain styles correctly', async () => {
    const { getByLabelText, queryByText } = render(<CameraScreen />);

    // Wait for permissions to be resolved
    await waitFor(() => expect(queryByText('camera.requesting_permissions')).toBeNull());

    // Click on Film section in Footer
    const filmSection = getByLabelText(/sections\.film/i) as any;
    expect(filmSection).toBeDefined();

    act(() => {
      fireEvent.press(filmSection);
    });

    // Verify UI Store updated to film section
    expect(useSystemStore.getState().activeSection).toBe('film');

    // Adjust grain intensity and verify grainEnabled toggles automatically
    act(() => {
      useFilmStore.getState().setGrainIntensity(0.75);
    });

    expect(useFilmStore.getState().grainIntensity.value).toBe(0.75);
    expect(useFilmStore.getState().grainEnabled.value).toBe(true);

    // Reset effect and verify it returns to default
    act(() => {
      useFilmStore.getState().resetEffect('grain');
    });

    expect(useFilmStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(useFilmStore.getState().grainEnabled.value).toBe(false);
  });
});
