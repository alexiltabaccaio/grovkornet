import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Modules } from './Modules';
import { useSystemStore } from '@entities/system';

describe('Modules', () => {
  it('renders nothing if activeSection is none', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('none');
    });
    const { toJSON } = render(<Modules />);
    expect(toJSON()).toBeNull();
  });

  it('renders correct modules for film section', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('film');
    });
    const { getByText } = render(<Modules />);
    expect(getByText('modules.development')).toBeDefined();
    expect(getByText('modules.texture')).toBeDefined();
  });

  it('switches active module on press', () => {
    act(() => {
      useSystemStore.getState().setActiveSection('film');
      useSystemStore.getState().setActiveModule('development');
    });
    const { getByText } = render(<Modules />);
    
    fireEvent.press(getByText('modules.texture'));
    expect(useSystemStore.getState().activeModule).toBe('texture');
  });
});
