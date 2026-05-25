import { useSystemStore } from './useSystemStore';

describe('useSystemStore', () => {
  beforeEach(() => {
    useSystemStore.setState({
      activeSection: 'none',
      activeModule: 'none',
      activeParameter: 'none',
      activeDetailPanel: 'none',
      isDebugEnabled: false,
      isLogsEnabled: false,
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
    const state = useSystemStore.getState();
    expect(state.activeSection).toBe('none');
    expect(state.activeModule).toBe('none');
    expect(state.activeParameter).toBe('none');
    expect(state.activeDetailPanel).toBe('none');
  });

  it('sets active section correctly', () => {
    const { setActiveSection } = useSystemStore.getState();
    setActiveSection('body');
    expect(useSystemStore.getState().activeSection).toBe('body');
  });

  it('sets active module and restores last active parameter', () => {
    const { setActiveModule, setActiveParameter } = useSystemStore.getState();
    
    // Set development module (which has 'temperature' as default in lastActiveParameters)
    setActiveModule('development');
    let state = useSystemStore.getState();
    expect(state.activeModule).toBe('development');
    expect(state.activeParameter).toBe('temperature');

    // Change parameter
    setActiveParameter('contrast');
    expect(useSystemStore.getState().activeParameter).toBe('contrast');

    // Switch to another module and back
    setActiveModule('texture');
    expect(useSystemStore.getState().activeModule).toBe('texture');
    expect(useSystemStore.getState().activeParameter).toBe('grain');

    setActiveModule('development');
    expect(useSystemStore.getState().activeModule).toBe('development');
    expect(useSystemStore.getState().activeParameter).toBe('contrast'); // Should be restored
  });

  it('updates debug mode correctly', () => {
    const { setIsDebugEnabled } = useSystemStore.getState();
    setIsDebugEnabled(true);
    expect(useSystemStore.getState().isDebugEnabled).toBe(true);
  });

  it('updates logs mode correctly', () => {
    const { setIsLogsEnabled } = useSystemStore.getState();
    setIsLogsEnabled(true);
    expect(useSystemStore.getState().isLogsEnabled).toBe(true);
  });

  it('sets active sub parameter and resets correctly', () => {
    const { setActiveDetailPanel, setActiveParameter, setActiveModule } = useSystemStore.getState();
    
    setActiveDetailPanel('grain_chroma');
    expect(useSystemStore.getState().activeDetailPanel).toBe('grain_chroma');

    // Reset on parameter change
    setActiveParameter('grain');
    expect(useSystemStore.getState().activeDetailPanel).toBe('none');

    setActiveDetailPanel('grain_size');
    expect(useSystemStore.getState().activeDetailPanel).toBe('grain_size');

    // Reset on module change
    setActiveModule('none');
    expect(useSystemStore.getState().activeDetailPanel).toBe('none');
  });

  it('sets latest captured uri correctly', () => {
    const { setLatestCapturedUri } = useSystemStore.getState();
    setLatestCapturedUri('file:///test/image.jpg');
    expect(useSystemStore.getState().latestCapturedUri).toBe('file:///test/image.jpg');

    setLatestCapturedUri(null);
    expect(useSystemStore.getState().latestCapturedUri).toBeNull();
  });

  it('memorizes last active module and parameter across section changes', () => {
    const { setActiveSection, setActiveModule, setActiveParameter } = useSystemStore.getState();

    // 1. Go to film section
    setActiveSection('film');
    expect(useSystemStore.getState().activeSection).toBe('film');
    expect(useSystemStore.getState().activeModule).toBe('development');
    expect(useSystemStore.getState().activeParameter).toBe('temperature');

    // 2. Change module to texture and parameter to sharpening
    setActiveModule('texture');
    setActiveParameter('sharpening');
    expect(useSystemStore.getState().activeModule).toBe('texture');
    expect(useSystemStore.getState().activeParameter).toBe('sharpening');

    // 3. Switch to body section
    setActiveSection('body');
    expect(useSystemStore.getState().activeSection).toBe('body');
    expect(useSystemStore.getState().activeModule).toBe('exposure');

    // 4. Switch back to film section
    setActiveSection('film');
    expect(useSystemStore.getState().activeSection).toBe('film');
    expect(useSystemStore.getState().activeModule).toBe('texture');
    expect(useSystemStore.getState().activeParameter).toBe('sharpening');
  });

  it('updates isDetailPanelOpen correctly', () => {
    const { setIsDetailPanelOpen } = useSystemStore.getState();
    setIsDetailPanelOpen(true);
    expect(useSystemStore.getState().isDetailPanelOpen).toBe(true);
  });

  it('triggers capture and resets after timeout', () => {
    jest.useFakeTimers();
    const { triggerCapture } = useSystemStore.getState();
    
    triggerCapture();
    expect(useSystemStore.getState().isCapturing).toBe(true);

    jest.advanceTimersByTime(200);
    expect(useSystemStore.getState().isCapturing).toBe(false);
    jest.useRealTimers();
  });

  it('handles fallback values when unknown section or module is provided', () => {
    const { setActiveSection, setActiveModule } = useSystemStore.getState();
    setActiveSection('unknown_section' as any);
    expect(useSystemStore.getState().activeModule).toBe('none');
    expect(useSystemStore.getState().activeParameter).toBe('none');

    setActiveModule('unknown_module' as any);
    expect(useSystemStore.getState().activeParameter).toBe('none');
  });
});
