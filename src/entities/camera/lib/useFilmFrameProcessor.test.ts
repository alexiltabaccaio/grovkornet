import { useFilmFrameProcessor } from './useFilmFrameProcessor';
import { Skia } from '@shopify/react-native-skia';

// Mocks
jest.mock('react-native-vision-camera', () => ({
  useSkiaFrameProcessor: jest.fn(cb => cb),
}));

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Paint: jest.fn(() => ({
      setImageFilter: jest.fn(),
    })),
    RuntimeEffect: {
      Make: jest.fn(() => ({})),
    },
    RuntimeShaderBuilder: jest.fn(() => ({
      setUniform: jest.fn(),
    })),
    ImageFilter: {
      MakeRuntimeShader: jest.fn(() => ({})),
    },
  },
}));

describe('useFilmFrameProcessor', () => {
  const mockProps = {
    wcGrainEnabled: { value: true },
    wcGrainIntensity: { value: 0.5 },
    wcSaturation: { value: 1.2 },
    wcContrast: { value: 1.1 },
    wcChromaticAberration: { value: 0.8 },
  };

  it('should initialize correctly', () => {
    const processor = useFilmFrameProcessor(mockProps);
    expect(processor).toBeDefined();
  });

  it('should set uniforms correctly when processing a frame', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processor = useFilmFrameProcessor(mockProps) as any;
    
    const mockFrame = {
      width: 1920,
      height: 1080,
      render: jest.fn(),
    };

    // Execute the worklet callback
    processor(mockFrame);

    // Verify Skia calls
    expect(Skia.RuntimeShaderBuilder).toHaveBeenCalled();
    const builderInstance = (Skia.RuntimeShaderBuilder as jest.Mock).mock.results[0].value;
    
    expect(builderInstance.setUniform).toHaveBeenCalledWith('resolution', [1920, 1080]);
    expect(builderInstance.setUniform).toHaveBeenCalledWith('saturation', [1.2]);
    expect(builderInstance.setUniform).toHaveBeenCalledWith('contrast', [1.1]);
    expect(builderInstance.setUniform).toHaveBeenCalledWith('aberrationIntensity', [0.8]);
    expect(builderInstance.setUniform).toHaveBeenCalledWith('grainIntensity', [0.5]);
    expect(builderInstance.setUniform).toHaveBeenCalledWith('grainEnabled', [1.0]);
    
    expect(mockFrame.render).toHaveBeenCalled();
  });
});
