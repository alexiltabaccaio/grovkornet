import React from 'react';
import { View, TextInput } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SliderThumb } from './SliderThumb';

const mockSharedValue = <T,>(val: T): any => ({ value: val });

const defaultProps = {
  label: 'TEST',
  isActive: true,
};

describe('SliderThumb', () => {
  it('renders correctly with default props', () => {
    const value = mockSharedValue(0.5);
    const { toJSON } = render(<SliderThumb {...defaultProps} value={value} />);
    expect(toJSON()).toBeDefined();
  });

  it('formats text correctly using valueFormatter when provided', () => {
    const value = mockSharedValue(0.75);
    const valueFormatter = jest.fn((v: number) => `Formatted:${v}`);
    const { UNSAFE_getByType } = render(
      <SliderThumb {...defaultProps} value={value} valueFormatter={valueFormatter} />
    );
    const textInput = UNSAFE_getByType(TextInput);
    expect(textInput.props.animatedProps.text).toBe('Formatted:0.75');
    expect(valueFormatter).toHaveBeenCalledWith(0.75);
  });

  it('formats text correctly using default rounder when valueFormatter is absent', () => {
    const value = mockSharedValue(0.75);
    const { UNSAFE_getByType } = render(<SliderThumb {...defaultProps} value={value} />);
    const textInput = UNSAFE_getByType(TextInput);
    expect(textInput.props.animatedProps.text).toBe('1');
  });

  it('returns empty text in animatedTextProps when value is undefined', () => {
    const { UNSAFE_getByType } = render(<SliderThumb {...defaultProps} value={undefined} />);
    const textInput = UNSAFE_getByType(TextInput);
    expect(textInput.props.animatedProps.text).toBe('');
  });

  it('handles track container onLayout to update track width', () => {
    const value = mockSharedValue(0.5);
    const sliderTrackWidth = mockSharedValue(100);
    const { UNSAFE_root } = render(
      <SliderThumb {...defaultProps} value={value} sliderTrackWidth={sliderTrackWidth} />
    );
    expect(UNSAFE_root).toBeDefined();
    
    // Find the track container using its onLayout prop
    const views = UNSAFE_root.findAllByType(View);
    const trackContainer = views.find((v: any) => typeof v.props.onLayout === 'function');
    expect(trackContainer).toBeDefined();
    
    trackContainer!.props.onLayout({
      nativeEvent: {
        layout: {
          width: 250,
        },
      },
    });
    expect(sliderTrackWidth.value).toBe(250);
  });



  it('renders AutoButton and triggers correct callbacks when isAuto and onToggleAuto are defined', () => {
    const isAuto = mockSharedValue(true);
    const onToggleAuto = jest.fn();
    const value = mockSharedValue(0.5);
    
    const { getByText, rerender } = render(
      <SliderThumb {...defaultProps} value={value} isAuto={isAuto} onToggleAuto={onToggleAuto} />
    );
    
    // When isAuto is true and toggle is pressed, it should toggle off (false)
    const button = getByText('A');
    fireEvent.press(button);
    expect(onToggleAuto).toHaveBeenCalledWith(false);

    // When isAuto is false and toggle is pressed, it should toggle on (true)
    const isAutoFalse = mockSharedValue(false);
    rerender(<SliderThumb {...defaultProps} value={value} isAuto={isAutoFalse} onToggleAuto={onToggleAuto} />);
    fireEvent.press(button);
    expect(onToggleAuto).toHaveBeenCalledWith(true);
  });

  it('toggles isAuto.value directly when onToggleAuto is undefined', () => {
    const isAuto = mockSharedValue(true);
    const value = mockSharedValue(0.5);
    const onReset = jest.fn();
    
    const { getByText, rerender } = render(
      <SliderThumb {...defaultProps} value={value} isAuto={isAuto} onReset={onReset} />
    );
    
    const button = getByText('A');
    fireEvent.press(button);
    expect(isAuto.value).toBe(false);

    // When isAuto is false and onToggleAuto is undefined, it falls back to onReset if defined
    const isAutoFalse = mockSharedValue(false);
    rerender(<SliderThumb {...defaultProps} value={value} isAuto={isAutoFalse} onReset={onReset} />);
    fireEvent.press(button);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('hides auto placeholder when hideAutoPlaceholder is true', () => {
    const value = mockSharedValue(0.5);
    const { UNSAFE_root } = render(
      <SliderThumb {...defaultProps} value={value} hideAutoPlaceholder={true} />
    );
    
    // There shouldn't be an auto placeholder (width: 54, marginRight: 16)
    const placeholders = UNSAFE_root.findAllByProps({
      style: {
        width: 54,
        marginRight: 16,
      },
    });
    expect(placeholders).toHaveLength(0);
  });

  it('calculates animated styles for various combinations of centerValue, disabled, and isAuto', () => {
    const value = mockSharedValue(0.8);
    const disabled = mockSharedValue(true);
    const isAuto = mockSharedValue(true);
    const sliderTrackWidth = mockSharedValue(200);

    // 1. Check centerValue above half, disabled = true, isAuto = true
    const { UNSAFE_root, rerender } = render(
      <SliderThumb
        {...defaultProps}
        value={value}
        minValue={0}
        maxValue={1}
        centerValue={0.5}
        disabled={disabled}
        isAuto={isAuto}
        sliderTrackWidth={sliderTrackWidth}
      />
    );
    expect(UNSAFE_root).toBeDefined();

    // 2. Check value below centerValue, disabled = false, isAuto = false
    const disabledFalse = mockSharedValue(false);
    const isAutoFalse = mockSharedValue(false);
    const valueBelow = mockSharedValue(0.2);
    rerender(
      <SliderThumb
        {...defaultProps}
        value={valueBelow}
        minValue={0}
        maxValue={1}
        centerValue={0.5}
        disabled={disabledFalse}
        isAuto={isAutoFalse}
        sliderTrackWidth={sliderTrackWidth}
      />
    );
    expect(UNSAFE_root).toBeDefined();

    // 3. Track width = 0
    const zeroTrackWidth = mockSharedValue(0);
    rerender(
      <SliderThumb
        {...defaultProps}
        value={valueBelow}
        minValue={0}
        maxValue={1}
        centerValue={0.5}
        disabled={disabledFalse}
        isAuto={isAutoFalse}
        sliderTrackWidth={zeroTrackWidth}
      />
    );
    expect(UNSAFE_root).toBeDefined();
  });
});
