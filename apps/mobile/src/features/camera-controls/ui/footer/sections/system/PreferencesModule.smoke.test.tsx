import React from 'react';
import { render } from '@testing-library/react-native';
import { PreferencesModule } from './PreferencesModule';

jest.mock('./preferences/grid/GridParam', () => ({ GridParam: () => null }));
jest.mock('./preferences/histogram/HistogramParam', () => ({ HistogramParam: () => null }));
jest.mock('./preferences/language/LanguageParam', () => ({ LanguageParam: () => null }));
jest.mock('./preferences/debug/DebugParam', () => ({ DebugParam: () => null }));

describe('PreferencesModule', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <PreferencesModule />
    );
    expect(toJSON()).toBeDefined();
  });
});
