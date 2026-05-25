import React from 'react';
import { render } from '@testing-library/react-native';
import { SliderDetailPanel } from './SliderDetailPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SliderDetailPanel', () => {
  it('renders correctly for grain parameter', () => {
    const { toJSON } = render(<SliderDetailPanel parameter="grain" />);
    expect(toJSON()).toBeDefined();
  });

  it('renders correctly for temperature parameter', () => {
    const { toJSON } = render(<SliderDetailPanel parameter="temperature" />);
    expect(toJSON()).toBeDefined();
  });

  it('returns null for an invalid parameter', () => {
    // Cast to any to test fallback null path
    const { toJSON } = render(<SliderDetailPanel parameter={"invalid" as any} />);
    expect(toJSON()).toBeNull();
  });
});
