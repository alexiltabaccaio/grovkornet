import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Modules } from './Modules';
import { useSystemStore, useControlPanelStore } from '@entities/system';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';
import * as filmControls from '@features/film-controls';

jest.mock('@features/film-controls', () => {
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
  };
});

describe('Modules', () => {
  beforeEach(() => {
    act(() => {
      useControlPanelStore.setState({
      activeSection: 'none',
      activeModule: 'none',
      activeParameter: 'none',
    });
    useSystemStore.setState({
      isLayoutOverlayEnabled: false,
    });
      useBodyStore.setState({
        capabilities: {
          hasTorch: true,
          maxTorchStrength: 1,
          isoMin: 100,
          isoMax: 3200,
          maxFps: 60,
        },
      });
      useLensStore.setState({
        capabilities: {
          supportsFocus: true,
          availableCameras: [{ id: '0', focalLength: 26, focalLength35mm: 26 }],
        },
      });
      useFilmStore.setState({
        capabilities: {
          availableNoiseReductionModes: [1, 2],
          availableEdgeModes: [1, 2],
        },
      });
    });
  });

  it('renders nothing if activeSection is none', () => {
    const { toJSON } = render(<Modules />);
    expect(toJSON()).toBeNull();
  });

  it('renders correct modules for film section', () => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('film');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.tone')).toBeDefined();
    expect(getByText('modules.color')).toBeDefined();
    expect(getByText('modules.texture')).toBeDefined();
    expect(getByText('modules.artifacts')).toBeDefined();
    expect(getByText('modules.details')).toBeDefined();
  });

  it('switches active module on press in film section', () => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('film');
      useControlPanelStore.getState().setActiveModule('tone');
    });
    const { getByText } = render(<Modules />);
    
    fireEvent.press(getByText('modules.texture'));
    expect(useControlPanelStore.getState().activeModule).toBe('texture');

    fireEvent.press(getByText('modules.color'));
    expect(useControlPanelStore.getState().activeModule).toBe('color');

    fireEvent.press(getByText('modules.artifacts'));
    expect(useControlPanelStore.getState().activeModule).toBe('artifacts');

    fireEvent.press(getByText('modules.details'));
    expect(useControlPanelStore.getState().activeModule).toBe('details');

    fireEvent.press(getByText('modules.tone'));
    expect(useControlPanelStore.getState().activeModule).toBe('tone');
  });

  it('renders correct modules and handles press for system section', () => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('system');
      useControlPanelStore.getState().setActiveModule('presets');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.presets')).toBeDefined();
    expect(getByText('modules.theme')).toBeDefined();
    expect(getByText('modules.preferences')).toBeDefined();

    fireEvent.press(getByText('modules.theme'));
    expect(useControlPanelStore.getState().activeModule).toBe('theme');

    fireEvent.press(getByText('modules.preferences'));
    expect(useControlPanelStore.getState().activeModule).toBe('preferences');

    fireEvent.press(getByText('modules.presets'));
    expect(useControlPanelStore.getState().activeModule).toBe('presets');
  });

  it('renders correct modules and handles press for lens section', () => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('lens');
      useControlPanelStore.getState().setActiveModule('optics');
    });
    const { getByText, queryByText } = render(<Modules />);
    expect(getByText('modules.optics')).toBeDefined();
    expect(queryByText('modules.flaws')).toBeNull();
    expect(queryByText('modules.artifacts')).toBeNull();
  });

  it('renders correct modules and handles press for body section', () => {
    act(() => {
      useControlPanelStore.getState().setActiveSection('body');
      useControlPanelStore.getState().setActiveModule('exposure');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.exposure')).toBeDefined();
    expect(getByText('modules.lighting')).toBeDefined();
    expect(getByText('modules.processing')).toBeDefined();
    expect(getByText('modules.capture')).toBeDefined();

    fireEvent.press(getByText('modules.lighting'));
    expect(useControlPanelStore.getState().activeModule).toBe('lighting');

    fireEvent.press(getByText('modules.processing'));
    expect(useControlPanelStore.getState().activeModule).toBe('processing');

    fireEvent.press(getByText('modules.capture'));
    expect(useControlPanelStore.getState().activeModule).toBe('capture');

    fireEvent.press(getByText('modules.exposure'));
    expect(useControlPanelStore.getState().activeModule).toBe('exposure');
  });

  it('renders with debug styles if isLayoutOverlayEnabled is true', () => {
    act(() => {
      useControlPanelStore.setState({
      activeSection: 'film',
    });
    useSystemStore.setState({
      isLayoutOverlayEnabled: true,
    });
    });
    const { toJSON } = render(<Modules />);
    expect(toJSON()).toBeDefined();
  });

  it('resets all parameters of a module on double press', () => {
    const spyResetEffect = jest.spyOn(filmControls, 'resetFilmEffect');

    act(() => {
      useControlPanelStore.setState({
      activeSection: 'film',
      activeModule: 'texture',
    });
    });

    const { getByText } = render(<Modules />);
    const button = getByText('modules.texture');

    act(() => {
      fireEvent.press(button);
      fireEvent.press(button);
    });

    expect(spyResetEffect).toHaveBeenCalledWith('grain');
    expect(spyResetEffect).toHaveBeenCalledWith('scanlines');
    expect(spyResetEffect).toHaveBeenCalledWith('pixelation');

    spyResetEffect.mockRestore();
  });
});

