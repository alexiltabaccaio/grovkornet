import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';
import { makeMutable } from 'react-native-reanimated';

// Mocks for icons and Skia (which often cause issues in node tests)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    RuntimeEffect: {
      Make: jest.fn()
    }
  },
  Canvas: 'Canvas',
  Rect: 'Rect',
  Shader: 'Shader'
}));

describe('Footer Component Stablity Test', () => {
  const mockProps = {
    enabled: makeMutable(false),
    grainIntensity: makeMutable(0.5),
    saturation: makeMutable(1.0),
    contrast: makeMutable(1.0),
    chromaticAberration: makeMutable(0),
    activeTab: 'none' as const,
    activeModule: 'none' as const,
    activeParameter: 'none' as const,
    onGrainToggle: jest.fn(),
    onTabChange: jest.fn(),
    onModuleChange: jest.fn(),
    onParameterChange: jest.fn(),
    onResetTool: jest.fn(),
    setChromaticAberration: jest.fn(),
  };

  it('should render correctly in default state', () => {
    const { toJSON } = render(<Footer {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when color tab is active', () => {
    const { toJSON } = render(<Footer {...mockProps} activeTab="color" activeModule="color_grading" />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when tape tab is active', () => {
    const { toJSON } = render(<Footer {...mockProps} activeTab="tape" activeModule="grain" />);
    expect(toJSON()).toBeDefined();
  });
});
