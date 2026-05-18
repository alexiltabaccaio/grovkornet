import React from 'react';
import { render } from '@testing-library/react-native';
import { BottomSheetHandle } from './BottomSheetHandle';

describe('BottomSheetHandle Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<BottomSheetHandle />);
    expect(toJSON()).toBeDefined();
  });
});
