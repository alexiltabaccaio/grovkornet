import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Sections } from './Sections';
import { useSystemStore, useControlPanelStore } from '@entities/system';

describe('Sections', () => {
  beforeEach(() => {
    useControlPanelStore.getState().setActiveSection('none');
  });

  it('renders all sections', () => {
    const { getByLabelText } = render(<Sections />);
    expect(getByLabelText('sections.system')).toBeDefined();
    expect(getByLabelText('sections.lens')).toBeDefined();
    expect(getByLabelText('sections.body')).toBeDefined();
    expect(getByLabelText('sections.film')).toBeDefined();
  });

  it('switches section and module on press', () => {
    const { getByLabelText } = render(<Sections />);
    
    // Click on Film section
    fireEvent.press(getByLabelText('sections.film'));
    
    expect(useControlPanelStore.getState().activeSection).toBe('film');
    expect(useControlPanelStore.getState().activeModule).toBe('tone');
  });

  it('toggles section off if clicked again', () => {
    const { getByLabelText } = render(<Sections />);
    
    // Click on Film section twice
    fireEvent.press(getByLabelText('sections.film'));
    fireEvent.press(getByLabelText('sections.film'));
    
    expect(useControlPanelStore.getState().activeSection).toBe('none');
    expect(useControlPanelStore.getState().activeModule).toBe('none');
  });
});
