import React from 'react';
import { render } from '@testing-library/react-native';
import { GestureController } from './GestureController';
import { useHardwareStore } from '../model/useHardwareStore';
import { useStylesStore } from '../model/useStylesStore';
import { useUIStore } from '../model/useUIStore';

// Mock the stores
jest.mock('../model/useHardwareStore');
jest.mock('../model/useStylesStore');
jest.mock('../model/useUIStore');

// Global mocks from jest.setup.ts are used

describe('GestureController', () => {
  const mockStyleStore = {
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0.0 },
    setGrainIntensity: jest.fn(),
    setSaturation: jest.fn(),
    setContrast: jest.fn(),
    setChromaticAberration: jest.fn(),
  };

  const mockHWStore = {
    iso: { value: 100 },
    shutterSpeed: { value: 0.01 },
    ev: { value: 0 },
    temperature: { value: 5000 },
    isoAuto: { value: true },
    shutterSpeedAuto: { value: true },
    temperatureAuto: { value: true },
    evAuto: { value: true },
    focusDistance: { value: 0 },
    focusAuto: { value: true },
    capabilities: { availableCameras: [] },
  };

  const mockUIStore = {
    activeModule: 'none',
    activeParameter: 'none',
    activeSubParameter: 'none',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStylesStore as unknown as jest.Mock).mockReturnValue(mockStyleStore);
    (useHardwareStore as unknown as jest.Mock).mockReturnValue(mockHWStore);
    (useUIStore as unknown as jest.Mock).mockReturnValue(mockUIStore);
  });

  it('should render null when activeModule is "none"', () => {
    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly when activeModule is "grain"', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'grain',
      activeParameter: 'grain',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render correctly when activeModule is "color_grading"', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'color_grading',
      activeParameter: 'saturation',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render correctly when activeModule is "lens_effects"', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'lens_effects',
      activeParameter: 'chromatic_aberration',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render null for unknown modules', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'something_else',
      activeParameter: 'none',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });
});
