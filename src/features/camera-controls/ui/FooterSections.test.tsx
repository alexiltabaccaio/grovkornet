import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FooterSections } from './FooterSections';
import { useUIStore } from '../model/useUIStore';

describe('FooterSections', () => {
  beforeEach(() => {
    useUIStore.getState().setActiveSection('none');
  });

  it('renders all sections', () => {
    const { getByText } = render(<FooterSections />);
    expect(getByText('tabs.exposure')).toBeDefined();
    expect(getByText('tabs.lens')).toBeDefined();
    expect(getByText('tabs.color')).toBeDefined();
  });

  it('switches section and module on press', () => {
    const { getByText } = render(<FooterSections />);
    
    // Click on Color section
    fireEvent.press(getByText('tabs.color'));
    
    expect(useUIStore.getState().activeSection).toBe('color');
    expect(useUIStore.getState().activeModule).toBe('color_grading');
  });

  it('toggles section off if clicked again', () => {
    const { getByText } = render(<FooterSections />);
    
    // Click on Color section twice
    fireEvent.press(getByText('tabs.color'));
    fireEvent.press(getByText('tabs.color'));
    
    expect(useUIStore.getState().activeSection).toBe('none');
    expect(useUIStore.getState().activeModule).toBe('none');
  });
});
