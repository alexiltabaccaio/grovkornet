import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FooterSections } from './FooterSections';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

describe('FooterSections', () => {
  beforeEach(() => {
    useUIStore.getState().setActiveSection('none');
  });

  it('renders all sections', () => {
    const { getByText } = render(<FooterSections />);
    expect(getByText('sections.system')).toBeDefined();
    expect(getByText('sections.lens')).toBeDefined();
    expect(getByText('sections.body')).toBeDefined();
    expect(getByText('sections.film')).toBeDefined();
  });

  it('switches section and module on press', () => {
    const { getByText } = render(<FooterSections />);
    
    // Click on Film section
    fireEvent.press(getByText('sections.film'));
    
    expect(useUIStore.getState().activeSection).toBe('film');
    expect(useUIStore.getState().activeModule).toBe('development');
  });

  it('toggles section off if clicked again', () => {
    const { getByText } = render(<FooterSections />);
    
    // Click on Film section twice
    fireEvent.press(getByText('sections.film'));
    fireEvent.press(getByText('sections.film'));
    
    expect(useUIStore.getState().activeSection).toBe('none');
    expect(useUIStore.getState().activeModule).toBe('none');
  });
});
