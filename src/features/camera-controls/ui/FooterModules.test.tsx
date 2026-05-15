import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { FooterModules } from './FooterModules';
import { useUIStore } from '../model/useUIStore';

describe('FooterModules', () => {
  it('renders nothing if activeSection is none', () => {
    act(() => {
      useUIStore.getState().setActiveSection('none');
    });
    const { toJSON } = render(<FooterModules />);
    expect(toJSON()).toBeNull();
  });

  it('renders correct modules for film section', () => {
    act(() => {
      useUIStore.getState().setActiveSection('film');
    });
    const { getByText } = render(<FooterModules />);
    expect(getByText('modules.development')).toBeDefined();
    expect(getByText('modules.texture')).toBeDefined();
  });

  it('switches active module on press', () => {
    act(() => {
      useUIStore.getState().setActiveSection('film');
      useUIStore.getState().setActiveModule('development');
    });
    const { getByText } = render(<FooterModules />);
    
    fireEvent.press(getByText('modules.texture'));
    expect(useUIStore.getState().activeModule).toBe('texture');
  });
});
