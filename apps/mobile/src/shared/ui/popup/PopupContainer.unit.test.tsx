import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import { PopupContainer } from './PopupContainer';

describe('PopupContainer', () => {
  it('renders nothing when visible is false', () => {
    render(
      <PopupContainer visible={false}>
        <></>
      </PopupContainer>
    );
    expect(screen.toJSON()).toBeNull();
  });

  it('renders children when visible is true', () => {
    render(
      <PopupContainer visible={true}>
        <React.Fragment>
          <></>
          <></>
        </React.Fragment>
      </PopupContainer>
    );
    expect(screen.root).toBeTruthy();
  });

  it('calls onClose when overlay is pressed', () => {
    const onClose = jest.fn();
    render(
      <PopupContainer visible={true} onClose={onClose}>
        <></>
      </PopupContainer>
    );
    
    // Find the overlay using testID
    const overlay = screen.getByTestId('popup-overlay');
    fireEvent.press(overlay);
    
    expect(onClose).toHaveBeenCalled();
  });
});
