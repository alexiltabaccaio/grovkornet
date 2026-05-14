import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FooterTabs } from './FooterTabs';
import { useUIStore } from '../model/useUIStore';

describe('FooterTabs', () => {
  beforeEach(() => {
    useUIStore.getState().setActiveTab('none');
  });

  it('renders all tabs', () => {
    const { getByText } = render(<FooterTabs />);
    expect(getByText('tabs.exposure')).toBeDefined();
    expect(getByText('tabs.lens')).toBeDefined();
    expect(getByText('tabs.color')).toBeDefined();
  });

  it('switches tab and module on press', () => {
    const { getByText } = render(<FooterTabs />);
    
    // Click on Color tab
    fireEvent.press(getByText('tabs.color'));
    
    expect(useUIStore.getState().activeTab).toBe('color');
    expect(useUIStore.getState().activeModule).toBe('color_grading');
  });

  it('toggles tab off if clicked again', () => {
    const { getByText } = render(<FooterTabs />);
    
    // Click on Color tab twice
    fireEvent.press(getByText('tabs.color'));
    fireEvent.press(getByText('tabs.color'));
    
    expect(useUIStore.getState().activeTab).toBe('none');
    expect(useUIStore.getState().activeModule).toBe('none');
  });
});
