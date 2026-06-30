import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Sections } from './Sections';
import { useControlPanelStore, useSystemStore } from '@entities/system';

describe('Sections', () => {
  beforeEach(() => {
    useControlPanelStore.getState().setActiveSection('none');
  });

  it('renders all sections', () => {
    const { getByLabelText, getByTestId } = render(<Sections />);
    expect(getByLabelText('sections.system')).toBeDefined();
    expect(getByLabelText('sections.lens')).toBeDefined();
    expect(getByLabelText('sections.body')).toBeDefined();
    expect(getByLabelText('sections.film')).toBeDefined();

    // Verify all buttons are initially in inactive style (do not have active background color)
    expect(getByTestId('section-button-system').props.style.backgroundColor).toBeUndefined();
    expect(getByTestId('section-button-film').props.style.backgroundColor).toBeUndefined();
  });

  it('switches section and module on press', () => {
    const { getByLabelText, getByTestId } = render(<Sections />);
    
    // Click on Film section
    fireEvent.press(getByLabelText('sections.film'));
    
    expect(useControlPanelStore.getState().activeSection).toBe('film');
    expect(useControlPanelStore.getState().activeModule).toBe('tone');

    // Verify active section button gets active background styling
    expect(getByTestId('section-button-film').props.style.backgroundColor).toBe('rgba(255, 87, 34, 0.15)');

    // Verify other buttons remain inactive
    expect(getByTestId('section-button-system').props.style.backgroundColor).toBeUndefined();
  });

  it('toggles section off if clicked again', () => {
    const { getByLabelText, getByTestId } = render(<Sections />);
    
    // Click on Film section twice
    fireEvent.press(getByLabelText('sections.film'));
    fireEvent.press(getByLabelText('sections.film'));
    
    expect(useControlPanelStore.getState().activeSection).toBe('none');
    expect(useControlPanelStore.getState().activeModule).toBe('none');

    // Verify it reverts to inactive style
    expect(getByTestId('section-button-film').props.style.backgroundColor).toBeUndefined();
  });

  it('handles animated style transitions', () => {
    const mockGalleryTransition = { value: 0.5 };
    const mockLayoutSyncOffset = { value: 10 };
    
    const { getByLabelText } = render(
      // @ts-expect-error - Mocked SharedValue for testing purposes
      <Sections galleryTransition={mockGalleryTransition} layoutSyncOffset={mockLayoutSyncOffset} />
    );
    
    expect(getByLabelText('sections.system')).toBeDefined();
  });

  it('handles animated style transitions when layoutSyncOffset is missing', () => {
    const mockGalleryTransition = { value: 0.5 };
    
    const { getByLabelText } = render(
      // @ts-expect-error - Mocked SharedValue for testing purposes
      <Sections galleryTransition={mockGalleryTransition} />
    );
    
    expect(getByLabelText('sections.system')).toBeDefined();
  });

  it('renders debug layout overlay components when enabled', () => {
    // Assert no hitbox by default
    const { queryAllByTestId, rerender } = render(<Sections />);
    expect(queryAllByTestId('debug-hitbox').length).toBe(0);

    // Enable overlay and rerender
    useSystemStore.setState({ isLayoutOverlayEnabled: true });
    rerender(<Sections />);
    
    // 4 sections -> should render 4 hitboxes
    expect(queryAllByTestId('debug-hitbox').length).toBe(4);
    
    // Reset state after test
    useSystemStore.setState({ isLayoutOverlayEnabled: false });
  });
});
