import { useCameraEffectsStore } from './useCameraEffectsStore';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_ISO
} from '@shared/constants/videoProcessing';

describe('useCameraEffectsStore', () => {
  beforeEach(() => {
    // Reset the store before each test if possible, or just re-initialize values
    const state = useCameraEffectsStore.getState();
    state.resetTool('grain');
    state.resetTool('iso');
    state.resetTool('ev');
    state.resetTool('saturation');
    state.resetTool('contrast');
  });

  it('initializes with default values', () => {
    const state = useCameraEffectsStore.getState();
    expect(state.grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(state.iso.value).toBe(DEFAULT_ISO);
    expect(state.isoAuto.value).toBe(true);
  });

  it('updates grain intensity and automatically enables grain', () => {
    const { setGrainIntensity } = useCameraEffectsStore.getState();
    
    setGrainIntensity(0.8);
    const state = useCameraEffectsStore.getState();
    expect(state.grainIntensity.value).toBe(0.8);
    expect(state.grainEnabled.value).toBe(true);

    setGrainIntensity(0);
    expect(useCameraEffectsStore.getState().grainEnabled.value).toBe(false);
  });

  it('updates ISO and switches to manual mode', () => {
    const { setIso } = useCameraEffectsStore.getState();
    
    setIso(800);
    const state = useCameraEffectsStore.getState();
    expect(state.iso.value).toBe(800);
    expect(state.isoAuto.value).toBe(false);
  });

  it('resets tool correctly', () => {
    const { setIso, resetTool } = useCameraEffectsStore.getState();
    
    setIso(1600);
    resetTool('iso');
    
    const state = useCameraEffectsStore.getState();
    expect(state.iso.value).toBe(DEFAULT_ISO);
    expect(state.isoAuto.value).toBe(true);
  });

  it('manages auto/manual switching for exposure', () => {
    const { setEvAuto, setEv } = useCameraEffectsStore.getState();
    
    setEvAuto(true);
    expect(useCameraEffectsStore.getState().evAuto.value).toBe(true);

    setEv(2.0);
    expect(useCameraEffectsStore.getState().evAuto.value).toBe(false);
    expect(useCameraEffectsStore.getState().ev.value).toBe(2.0);
  });

  it('updates debug info correctly', () => {
    const { setDebugInfo } = useCameraEffectsStore.getState();
    
    setDebugInfo(60, '1920x1080', 60);
    const state = useCameraEffectsStore.getState();
    expect(state.fps.value).toBe(60);
    expect(state.resolution.value).toBe('1920x1080');
  });
});
