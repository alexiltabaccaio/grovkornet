import React from 'react';
import { render } from '@testing-library/react-native';
import { SliderPanel } from './SliderPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SliderPanel', () => {
  it('renders correctly for grain parameter', () => {
    const { toJSON } = render(<SliderPanel parameter="grain" />);
    expect(toJSON()).toBeDefined();
  });

  it('renders correctly for temperature parameter', () => {
    const { toJSON } = render(<SliderPanel parameter="temperature" />);
    expect(toJSON()).toBeDefined();
  });

  it('returns null for an invalid parameter', () => {
    // Cast to any to test fallback null path
    const { toJSON } = render(<SliderPanel parameter={"invalid" as any} />);
    expect(toJSON()).toBeNull();
  });
});
