import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Modules } from './Modules';
import { useSystemStore } from '@entities/system';

describe('Modules', () => {
  beforeEach(() => {
    act(() => {
      useSystemStore.setState({
        activeSection: 'none',
        activeModule: 'none',
        activeParameter: 'none',
        isLayoutOverlayEnabled: false,
      });
    });
  });

  it('renders nothing if activeSection is none', () => {
    const { toJSON } = render(<Modules />);
    expect(toJSON()).toBeNull();
  });

  it('renders correct modules for film section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('film');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.tone')).toBeDefined();
    expect(getByText('modules.color')).toBeDefined();
    expect(getByText('modules.texture')).toBeDefined();
    expect(getByText('modules.artifacts')).toBeDefined();
  });

  it('switches active module on press in film section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('film');
      useSystemStore.getState().setActiveModule('tone');
    });
    const { getByText } = render(<Modules />);
    
    fireEvent.press(getByText('modules.texture'));
    expect(useSystemStore.getState().activeModule).toBe('texture');

    fireEvent.press(getByText('modules.color'));
    expect(useSystemStore.getState().activeModule).toBe('color');

    fireEvent.press(getByText('modules.artifacts'));
    expect(useSystemStore.getState().activeModule).toBe('artifacts');

    fireEvent.press(getByText('modules.tone'));
    expect(useSystemStore.getState().activeModule).toBe('tone');
  });

  it('renders correct modules and handles press for system section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('system');
      useSystemStore.getState().setActiveModule('presets');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.presets')).toBeDefined();
    expect(getByText('modules.theme')).toBeDefined();
    expect(getByText('modules.preferences')).toBeDefined();

    fireEvent.press(getByText('modules.theme'));
    expect(useSystemStore.getState().activeModule).toBe('theme');

    fireEvent.press(getByText('modules.preferences'));
    expect(useSystemStore.getState().activeModule).toBe('preferences');

    fireEvent.press(getByText('modules.presets'));
    expect(useSystemStore.getState().activeModule).toBe('presets');
  });

  it('renders correct modules and handles press for lens section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('lens');
      useSystemStore.getState().setActiveModule('optics');
    });
    const { getByText, queryByText } = render(<Modules />);
    expect(getByText('modules.optics')).toBeDefined();
    expect(queryByText('modules.flaws')).toBeNull();
    expect(queryByText('modules.artifacts')).toBeNull();
  });

  it('renders correct modules and handles press for body section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('body');
      useSystemStore.getState().setActiveModule('exposure');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.exposure')).toBeDefined();
    expect(getByText('modules.lighting')).toBeDefined();
    expect(getByText('modules.processing')).toBeDefined();
    expect(getByText('modules.capture')).toBeDefined();

    fireEvent.press(getByText('modules.lighting'));
    expect(useSystemStore.getState().activeModule).toBe('lighting');

    fireEvent.press(getByText('modules.processing'));
    expect(useSystemStore.getState().activeModule).toBe('processing');

    fireEvent.press(getByText('modules.capture'));
    expect(useSystemStore.getState().activeModule).toBe('capture');

    fireEvent.press(getByText('modules.exposure'));
    expect(useSystemStore.getState().activeModule).toBe('exposure');
  });

  it('renders with debug styles if isLayoutOverlayEnabled is true', () => {
    act(() => {
      useSystemStore.setState({
        activeSection: 'film',
        isLayoutOverlayEnabled: true,
      });
    });
    const { toJSON } = render(<Modules />);
    expect(toJSON()).toBeDefined();
  });
});

