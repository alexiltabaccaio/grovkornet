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

  it('renders correct modules for color section', () => {
    act(() => {
      useUIStore.getState().setActiveSection('color');
    });
    const { getByText } = render(<FooterModules />);
    expect(getByText('modules.color_grading')).toBeDefined();
    expect(getByText('modules.fade')).toBeDefined();
  });

  it('switches active module on press', () => {
    act(() => {
      useUIStore.getState().setActiveSection('color');
      useUIStore.getState().setActiveModule('color_grading');
    });
    const { getByText } = render(<FooterModules />);
    
    fireEvent.press(getByText('modules.fade'));
    expect(useUIStore.getState().activeModule).toBe('fade');
  });
});
