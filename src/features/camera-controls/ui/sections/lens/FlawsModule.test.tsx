import React from 'react';
import { render } from '@testing-library/react-native';
import { FlawsModule } from './FlawsModule';
import { ParameterType } from '@shared/types/camera';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));


jest.mock('../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('FlawsModule', () => {
  const mockProps = {
    activeParameter: 'chromatic_aberration' as ParameterType,
    setActiveParameter: jest.fn(),
    chromaticAberration: { value: 0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setChromaticAberration: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<FlawsModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
