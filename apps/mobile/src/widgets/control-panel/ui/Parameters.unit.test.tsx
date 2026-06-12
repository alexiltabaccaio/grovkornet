/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { Parameters } from './Parameters';
import { useSystemStore } from '@entities/system';
import { useFilmStore } from '@entities/film';
import * as filmControls from '@features/film-controls';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { DEFAULT_TORCH_STRENGTH } from '@grovkornet/shared';

// Mock submodules from features to render buttons that invoke handlePressWithDouble
jest.mock('@features/film-controls', () => {
  const React = require('react');
  const { Button } = require('react-native');
  const actual = jest.requireActual('@features/film-controls');
  const mockResetFilmEffect = jest.fn();
  return { 
    ...actual,
    resetFilmEffect: mockResetFilmEffect,
    resetFilmParameter: jest.fn((param) => {
      if (['grain', 'chroma_shift', 'sharpening', 'noise_reduction', 'scanlines', 'pixelation'].includes(param)) {
        mockResetFilmEffect(param);
        return true;
      }
      return actual.resetFilmParameter(param);
    }),
    TextureModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-grain" title="Texture" onPress={() => {
        handlePressWithDouble('grain', () => {});
        handlePressWithDouble('grain', () => {});
      }} />
    ),
    ColorModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-temp" title="Color" onPress={() => {
        handlePressWithDouble('temperature', () => {});
        handlePressWithDouble('temperature', () => {});
      }} />
    ),
    ToneModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-contrast" title="Tone" onPress={() => {
        handlePressWithDouble('contrast', () => {});
        handlePressWithDouble('contrast', () => {});
      }} />
    ),
    ArtifactsModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-film-artifacts" title="Film Artifacts" onPress={() => {
        handlePressWithDouble('chroma_shift', () => {});
        handlePressWithDouble('chroma_shift', () => {});
      }} />
    ),
    DetailsModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-sharpening" title="Details" onPress={() => {
        handlePressWithDouble('sharpening', () => {});
        handlePressWithDouble('sharpening', () => {});
      }} />
    ),
  };
});

jest.mock('@features/lens-controls', () => {
  const React = require('react');
  const { Button } = require('react-native');
  const actual = jest.requireActual('@features/lens-controls');
  return {
    ...actual,
    OpticsModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-optics" title="Optics" onPress={() => {
        handlePressWithDouble('focus', () => {});
        handlePressWithDouble('focus', () => {});
        handlePressWithDouble('camera_selection', () => {});
        handlePressWithDouble('camera_selection', () => {});
      }} />
    ),
  };
});

jest.mock('@features/body-controls', () => {
  const React = require('react');
  const { Button } = require('react-native');
  const actual = jest.requireActual('@features/body-controls');
  return {
    ...actual,
    ExposureModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-exposure" title="Exposure" onPress={() => {
        handlePressWithDouble('ev', () => {});
        handlePressWithDouble('ev', () => {});
        handlePressWithDouble('iso', () => {});
        handlePressWithDouble('iso', () => {});
        handlePressWithDouble('shutter_speed', () => {});
        handlePressWithDouble('shutter_speed', () => {});
      }} />
    ),
    LightingModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-lighting" title="Lighting" onPress={() => {
        handlePressWithDouble('torch', () => {});
        handlePressWithDouble('torch', () => {});
      }} />
    ),
    CaptureModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-capture" title="Capture" onPress={() => {
        handlePressWithDouble('fps_setting', () => {});
        handlePressWithDouble('fps_setting', () => {});
      }} />
    ),
    ProcessingModule: ({ handlePressWithDouble }: any) => (
      <Button testID="btn-processing" title="Processing" onPress={() => {
        handlePressWithDouble('noise_reduction', () => {});
        handlePressWithDouble('noise_reduction', () => {});
      }} />
    ),
  };
});

jest.mock('@features/system-settings', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    PreferencesModule: () => <Text>PreferencesModule</Text>,
    ThemeModule: () => <Text>ThemeModule</Text>,
  };
});

describe('Parameters', () => {
  let spyResetEffect: jest.SpyInstance;
  let spySetEvAuto: jest.SpyInstance;
  let spySetIsoAuto: jest.SpyInstance;
  let spySetShutterSpeedAuto: jest.SpyInstance;
  let spySetFocusAuto: jest.SpyInstance;
  let spySetTemperatureAuto: jest.SpyInstance;
  let spySetContrastAuto: jest.SpyInstance;
  let spySetBlackLevelAuto: jest.SpyInstance;
  let spySetHighlightsAuto: jest.SpyInstance;
  let spySetPivotAuto: jest.SpyInstance;
  let spySetCameraAuto: jest.SpyInstance;
  let spySetTorchState: jest.SpyInstance;
  let spySetTorchStrength: jest.SpyInstance;
  let spySetFpsSetting: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    spyResetEffect = jest.spyOn(filmControls, 'resetFilmEffect');
    spySetEvAuto = jest.spyOn(useBodyStore.getState(), 'setEvAuto');
    spySetIsoAuto = jest.spyOn(useBodyStore.getState(), 'setIsoAuto');
    spySetShutterSpeedAuto = jest.spyOn(useBodyStore.getState(), 'setShutterSpeedAuto');
    spySetFocusAuto = jest.spyOn(useLensStore.getState(), 'setFocusAuto');
    spySetTemperatureAuto = jest.spyOn(useFilmStore.getState(), 'setTemperatureAuto');
    spySetContrastAuto = jest.spyOn(useFilmStore.getState(), 'setContrastAuto');
    spySetBlackLevelAuto = jest.spyOn(useFilmStore.getState(), 'setBlackLevelAuto');
    spySetHighlightsAuto = jest.spyOn(useFilmStore.getState(), 'setHighlightsAuto');
    spySetPivotAuto = jest.spyOn(useFilmStore.getState(), 'setPivotAuto');
    spySetCameraAuto = jest.spyOn(useLensStore.getState(), 'setCameraAuto');
    spySetTorchState = jest.spyOn(useBodyStore.getState(), 'setTorchState');
    spySetTorchStrength = jest.spyOn(useBodyStore.getState(), 'setTorchStrength');
    spySetFpsSetting = jest.spyOn(useBodyStore.getState(), 'setFpsSetting');
  });

  afterEach(() => {
    spyResetEffect.mockRestore();
    spySetEvAuto.mockRestore();
    spySetIsoAuto.mockRestore();
    spySetShutterSpeedAuto.mockRestore();
    spySetFocusAuto.mockRestore();
    spySetTemperatureAuto.mockRestore();
    spySetContrastAuto.mockRestore();
    spySetBlackLevelAuto.mockRestore();
    spySetHighlightsAuto.mockRestore();
    spySetPivotAuto.mockRestore();
    spySetCameraAuto.mockRestore();
    spySetTorchState.mockRestore();
    spySetTorchStrength.mockRestore();
    spySetFpsSetting.mockRestore();
  });

  it('renders nothing inside if activeModule is none', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('none');
    });
    const { toJSON } = render(<Parameters />);
    expect((toJSON() as { children?: unknown } | null)?.children).toBeNull();
  });

  it('renders TextureModule and resets grain effect', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('texture');
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-grain');
    expect(button).toBeDefined();

    fireEvent.press(button);
    expect(spyResetEffect).toHaveBeenCalledWith('grain');
  });

  it('renders ColorModule and resets temperature', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('color');
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-temp');
    
    fireEvent.press(button);
    expect(spySetTemperatureAuto).toHaveBeenCalledWith(true);
  });

  it('renders ToneModule and resets contrast', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('tone');
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-contrast');
    
    fireEvent.press(button);
    expect(spySetContrastAuto).toHaveBeenCalledWith(true);
  });

  it('renders ArtifactsModule and resets chroma_shift effect', () => {
    act(() => {
      useSystemStore.setState({ activeSection: 'film', activeModule: 'artifacts' });
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-film-artifacts');
    
    fireEvent.press(button);
    expect(spyResetEffect).toHaveBeenCalledWith('chroma_shift');
  });

  it('renders DetailsModule and resets sharpening effect', () => {
    act(() => {
      useSystemStore.setState({ activeSection: 'film', activeModule: 'details' });
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-sharpening');
    
    fireEvent.press(button);
    expect(spyResetEffect).toHaveBeenCalledWith('sharpening');
  });

  it('renders ProcessingModule and resets noise_reduction effect', () => {
    act(() => {
      useSystemStore.setState({ activeSection: 'body', activeModule: 'processing' });
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-processing');
    
    fireEvent.press(button);
    expect(spyResetEffect).toHaveBeenCalledWith('noise_reduction');
  });

  it('renders OpticsModule and resets focus / camera_selection', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('optics');
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-optics');
    
    fireEvent.press(button);
    expect(spySetFocusAuto).toHaveBeenCalledWith(true);
    expect(spySetCameraAuto).toHaveBeenCalledWith(true);
  });

  it('renders ExposureModule and resets ev, iso, shutter_speed', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('exposure');
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-exposure');
    
    fireEvent.press(button);
    expect(spySetEvAuto).toHaveBeenCalledWith(true);
    expect(spySetIsoAuto).toHaveBeenCalledWith(true);
    expect(spySetShutterSpeedAuto).toHaveBeenCalledWith(true);
  });

  it('renders LightingModule and resets torchState', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('lighting');
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-lighting');
    
    fireEvent.press(button);
    expect(spySetTorchState).toHaveBeenCalledWith(0);
    expect(spySetTorchStrength).toHaveBeenCalledWith(DEFAULT_TORCH_STRENGTH);
  });

  it('renders CaptureModule and resets fps_setting (fps >= 60 case)', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('capture');
      useBodyStore.getState().capabilities.maxFps = 60;
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-capture');
    
    fireEvent.press(button);
    expect(spySetFpsSetting).toHaveBeenCalledWith(60);
  });

  it('renders CaptureModule and resets fps_setting (fps < 60 case)', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('capture');
      useBodyStore.getState().capabilities.maxFps = 30;
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-capture');
    
    fireEvent.press(button);
    expect(spySetFpsSetting).toHaveBeenCalledWith(30);
  });

  it('renders CaptureModule and resets fps_setting when maxFps is undefined', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('capture');
      useBodyStore.getState().capabilities.maxFps = undefined;
    });
    const { getByTestId } = render(<Parameters />);
    const button = getByTestId('btn-capture');
    
    fireEvent.press(button);
    expect(spySetFpsSetting).toHaveBeenCalledWith(60);
  });

  it('renders PreferencesModule', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('preferences');
    });
    const { getByText } = render(<Parameters />);
    expect(getByText('PreferencesModule')).toBeDefined();
  });

  it('renders ThemeModule', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('theme');
    });
    const { getByText } = render(<Parameters />);
    expect(getByText('ThemeModule')).toBeDefined();
  });

  it('renders coming soon for unknown module', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('unknown' as any);
    });
    const { getByText } = render(<Parameters />);
    expect(getByText('footer.coming_soon')).toBeDefined();
  });

  it('updates lastActive module when activeModule changes between non-none values', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('texture');
    });
    const { getByTestId, rerender } = render(<Parameters />);
    expect(getByTestId('btn-grain')).toBeDefined();

    act(() => {
      useSystemStore.getState().setActiveModule('color');
    });
    rerender(<Parameters />);
    expect(getByTestId('btn-temp')).toBeDefined();
  });
});

