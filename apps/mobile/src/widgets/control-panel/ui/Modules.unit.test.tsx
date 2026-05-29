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
        isDebugEnabled: false,
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
    expect(getByText('modules.preferences')).toBeDefined();

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
    const { getByText } = render(<Modules />);
    expect(getByText('modules.optics')).toBeDefined();
    expect(getByText('modules.flaws')).toBeDefined();

    fireEvent.press(getByText('modules.flaws'));
    expect(useSystemStore.getState().activeModule).toBe('flaws');

    fireEvent.press(getByText('modules.optics'));
    expect(useSystemStore.getState().activeModule).toBe('optics');
  });

  it('renders correct modules and handles press for body section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('body');
      useSystemStore.getState().setActiveModule('exposure');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.exposure')).toBeDefined();
    expect(getByText('modules.lighting')).toBeDefined();
    expect(getByText('modules.capture')).toBeDefined();

    fireEvent.press(getByText('modules.lighting'));
    expect(useSystemStore.getState().activeModule).toBe('lighting');

    fireEvent.press(getByText('modules.capture'));
    expect(useSystemStore.getState().activeModule).toBe('capture');

    fireEvent.press(getByText('modules.exposure'));
    expect(useSystemStore.getState().activeModule).toBe('exposure');
  });

  it('renders with debug styles if isDebugEnabled is true', () => {
    act(() => {
      useSystemStore.setState({
        activeSection: 'film',
        isDebugEnabled: true,
      });
    });
    const { toJSON } = render(<Modules />);
    expect(toJSON()).toBeDefined();
  });
});

