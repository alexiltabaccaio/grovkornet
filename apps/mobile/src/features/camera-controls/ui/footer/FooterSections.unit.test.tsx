import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FooterSections } from './FooterSections';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

describe('FooterSections', () => {
  beforeEach(() => {
    useUIStore.getState().setActiveSection('none');
  });

  it('renders all sections', () => {
    const { getByLabelText } = render(<FooterSections />);
    expect(getByLabelText('sections.system')).toBeDefined();
    expect(getByLabelText('sections.lens')).toBeDefined();
    expect(getByLabelText('sections.body')).toBeDefined();
    expect(getByLabelText('sections.film')).toBeDefined();
  });

  it('switches section and module on press', () => {
    const { getByLabelText } = render(<FooterSections />);
    
    // Click on Film section
    fireEvent.press(getByLabelText('sections.film'));
    
    expect(useUIStore.getState().activeSection).toBe('film');
    expect(useUIStore.getState().activeModule).toBe('development');
  });

  it('toggles section off if clicked again', () => {
    const { getByLabelText } = render(<FooterSections />);
    
    // Click on Film section twice
    fireEvent.press(getByLabelText('sections.film'));
    fireEvent.press(getByLabelText('sections.film'));
    
    expect(useUIStore.getState().activeSection).toBe('none');
    expect(useUIStore.getState().activeModule).toBe('none');
  });
});
