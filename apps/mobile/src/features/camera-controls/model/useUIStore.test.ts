import { useUIStore } from './useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeSection: 'none',
      activeModule: 'none',
      activeParameter: 'none',
      activeSubParameter: 'none',
      isDebugEnabled: false,
      lastActiveModules: {
        none: 'none',
        system: 'preferences',
        lens: 'optics',
        body: 'exposure',
        film: 'development',
      },
      lastActiveParameters: {
        none: 'none',
        preferences: 'language',
        optics: 'camera_selection',
        flaws: 'chromatic_aberration',
        exposure: 'iso',
        lighting: 'torch',
        development: 'temperature',
        texture: 'grain',
        capture: 'aspect_ratio',
      },
    });
  });

  it('initializes with default values', () => {
    const state = useUIStore.getState();
    expect(state.activeSection).toBe('none');
    expect(state.activeModule).toBe('none');
    expect(state.activeParameter).toBe('none');
    expect(state.activeSubParameter).toBe('none');
  });

  it('sets active section correctly', () => {
    const { setActiveSection } = useUIStore.getState();
    setActiveSection('body');
    expect(useUIStore.getState().activeSection).toBe('body');
  });

  it('sets active module and restores last active parameter', () => {
    const { setActiveModule, setActiveParameter } = useUIStore.getState();
    
    // Set development module (which has 'temperature' as default in lastActiveParameters)
    setActiveModule('development');
    let state = useUIStore.getState();
    expect(state.activeModule).toBe('development');
    expect(state.activeParameter).toBe('temperature');

    // Change parameter
    setActiveParameter('contrast');
    expect(useUIStore.getState().activeParameter).toBe('contrast');

    // Switch to another module and back
    setActiveModule('texture');
    expect(useUIStore.getState().activeModule).toBe('texture');
    expect(useUIStore.getState().activeParameter).toBe('grain');

    setActiveModule('development');
    expect(useUIStore.getState().activeModule).toBe('development');
    expect(useUIStore.getState().activeParameter).toBe('contrast'); // Should be restored
  });

  it('updates debug mode correctly', () => {
    const { setIsDebugEnabled } = useUIStore.getState();
    setIsDebugEnabled(true);
    expect(useUIStore.getState().isDebugEnabled).toBe(true);
  });

  it('sets active sub parameter and resets correctly', () => {
    const { setActiveSubParameter, setActiveParameter, setActiveModule } = useUIStore.getState();
    
    setActiveSubParameter('grain_chroma');
    expect(useUIStore.getState().activeSubParameter).toBe('grain_chroma');

    // Reset on parameter change
    setActiveParameter('grain');
    expect(useUIStore.getState().activeSubParameter).toBe('none');

    setActiveSubParameter('grain_size');
    expect(useUIStore.getState().activeSubParameter).toBe('grain_size');

    // Reset on module change
    setActiveModule('none');
    expect(useUIStore.getState().activeSubParameter).toBe('none');
  });

  it('sets latest captured uri correctly', () => {
    const { setLatestCapturedUri } = useUIStore.getState();
    setLatestCapturedUri('file:///test/image.jpg');
    expect(useUIStore.getState().latestCapturedUri).toBe('file:///test/image.jpg');

    setLatestCapturedUri(null);
    expect(useUIStore.getState().latestCapturedUri).toBeNull();
  });

  it('memorizes last active module and parameter across section changes', () => {
    const { setActiveSection, setActiveModule, setActiveParameter } = useUIStore.getState();

    // 1. Go to film section
    setActiveSection('film');
    expect(useUIStore.getState().activeSection).toBe('film');
    expect(useUIStore.getState().activeModule).toBe('development');
    expect(useUIStore.getState().activeParameter).toBe('temperature');

    // 2. Change module to texture and parameter to sharpening
    setActiveModule('texture');
    setActiveParameter('sharpening');
    expect(useUIStore.getState().activeModule).toBe('texture');
    expect(useUIStore.getState().activeParameter).toBe('sharpening');

    // 3. Switch to body section
    setActiveSection('body');
    expect(useUIStore.getState().activeSection).toBe('body');
    expect(useUIStore.getState().activeModule).toBe('exposure');

    // 4. Switch back to film section
    setActiveSection('film');
    expect(useUIStore.getState().activeSection).toBe('film');
    expect(useUIStore.getState().activeModule).toBe('texture');
    expect(useUIStore.getState().activeParameter).toBe('sharpening');
  });
});

