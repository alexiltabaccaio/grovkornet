import React from 'react';
import { render } from '@testing-library/react-native';
import { ControlPanel } from './ControlPanel';

import { useSystemStore, SectionType, ModuleType, ParameterType } from '@entities/system';
import { useBodyStore } from '@entities/body';
import { useLensStore } from '@entities/lens';
import { useFilmStore } from '@entities/film';

// Mocks for icons (which often cause issues in node tests)
// Reanimated is mocked in jest.setup.ts

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('./Sections', () => ({
  Sections: 'Sections',
}));

jest.mock('./Modules', () => ({
  Modules: 'Modules',
}));

jest.mock('./Parameters', () => ({
  Parameters: 'Parameters',
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn(),
  ParameterControl: 'ParameterControl',
  ParameterPanelWrapper: 'ParameterPanelWrapper',
}));

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn(),
  useBodyParameterControlData: () => ({
    value: 0,
    minValue: 0,
    maxValue: 1,
    onChange: jest.fn(),
  }),
  useBodyWorklets: () => ({
    updateTorchStrength: jest.fn(),
  }),
}));

jest.mock('@entities/lens', () => ({
  useLensStore: jest.fn(),
  useLensParameterControlData: () => ({
    value: 0,
    minValue: 0,
    maxValue: 1,
    onChange: jest.fn(),
  }),
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn(),
  useFilmParameterControlData: () => ({
    value: 0,
    minValue: 0,
    maxValue: 1,
    onChange: jest.fn(),
  }),
  useFilmWorklets: () => ({
    updateGrainIntensity: jest.fn(),
  }),
}));

describe('ControlPanel Component Stability Test', () => {
  const mockSystemStoreValue = {
    activeSection: 'none' as SectionType,
    activeModule: 'none' as ModuleType,
    activeParameter: 'none' as ParameterType,
    activeDetailPanel: 'none' as any,
    isLayoutOverlayEnabled: false,
    setActiveSection: jest.fn(),
    setActiveModule: jest.fn(),
    setActiveParameter: jest.fn(),
    setActiveDetailPanel: jest.fn(),
    setIsLayoutOverlayEnabled: jest.fn(),
  };

  const mockBodyStoreValue = {
    iso: { value: 100 },
    shutterSpeed: { value: 0.01 },
    ev: { value: 0 },
    torchState: { value: 0 },
    torchStrength: { value: 0.5 },
    setTorchState: jest.fn(),
    setTorchStrength: jest.fn(),
    resolutionSetting: { value: 1 },
    fpsSetting: { value: 30 },
    aspectRatio: { value: 1 },
    previewQuality: { value: 1 },
    setPreviewQuality: jest.fn(),
  };

  const mockLensStoreValue = {
    focus: { value: 0.5 },
    capabilities: { availableCameras: [] },
    zoom: { value: 1 },
    activeCameraId: '0',
    setFocus: jest.fn(),
    setCameraId: jest.fn(),
  };

  const mockFilmStoreValue = {
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    hue: { value: 0.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0 },
    resetEffect: jest.fn(),
    grainEnabled: { value: true },
    grainSize: { value: 1.0 },
    grainChroma: { value: 0 },
    temperature: { value: 5000 },
    tint: { value: 0 },
  };

  beforeEach(() => {
    (useSystemStore as unknown as jest.Mock).mockReturnValue(mockSystemStoreValue);
    (useBodyStore as unknown as jest.Mock).mockReturnValue(mockBodyStoreValue);
    (useLensStore as unknown as jest.Mock).mockReturnValue(mockLensStoreValue);
    (useFilmStore as unknown as jest.Mock).mockReturnValue(mockFilmStoreValue);
  });

  it('should render correctly in default state', () => {
    const { toJSON } = render(<ControlPanel />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when film section is active', () => {
    (useSystemStore as unknown as jest.Mock).mockReturnValue({
      ...mockSystemStoreValue,
      activeSection: 'film',
      activeModule: 'tone',
    });
    const { toJSON } = render(<ControlPanel />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when texture section is active', () => {
    (useSystemStore as unknown as jest.Mock).mockReturnValue({
      ...mockSystemStoreValue,
      activeSection: 'film',
      activeModule: 'texture',
    });
    const { toJSON } = render(<ControlPanel />);
    expect(toJSON()).toBeDefined();
  });
});
