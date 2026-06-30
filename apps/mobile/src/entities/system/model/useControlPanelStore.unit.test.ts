import { useControlPanelStore } from './useControlPanelStore';

describe('useControlPanelStore', () => {
  beforeEach(() => {
    useControlPanelStore.setState({
      activeSection: 'none',
      activeModule: 'none',
      activeParameter: 'none',
      activeDetailPanel: 'none',
      isDetailPanelOpen: false,
      selectedColorIndex: 0,
      lastNonNoneSection: 'none',
      lastNonNoneModule: 'none',
      lastActiveModules: {
        none: 'none',
        system: 'preferences',
        lens: 'optics',
        body: 'exposure',
        film: 'tone',
      },
      lastActiveParameters: {
        none: 'none',
        preferences: 'language',
        presets: 'presets',
        theme: 'none',
        optics: 'camera_selection',
        optical_effects: 'chromatic_aberration',
        artifacts: 'chroma_shift',
        exposure: 'iso',
        lighting: 'torch',
        processing: 'noise_reduction',
        tone: 'contrast',
        color: 'temperature',
        texture: 'grain',
        details: 'sharpening',
        capture: 'aspect_ratio',
        debug: 'ui_overlay',
      },
    });
  });

  it('initializes with default values', () => {
    const state = useControlPanelStore.getState();
    expect(state.activeSection).toBe('none');
    expect(state.activeModule).toBe('none');
    expect(state.activeParameter).toBe('none');
    expect(state.activeDetailPanel).toBe('none');
    expect(state.selectedColorIndex).toBe(0);
  });

  it('sets active section correctly', () => {
    const { setActiveSection } = useControlPanelStore.getState();
    setActiveSection('body');
    expect(useControlPanelStore.getState().activeSection).toBe('body');
  });

  it('sets active module and restores last active parameter', () => {
    const { setActiveModule, setActiveParameter } = useControlPanelStore.getState();
    
    // Set color module (which has 'temperature' as default in lastActiveParameters)
    setActiveModule('color');
    let state = useControlPanelStore.getState();
    expect(state.activeModule).toBe('color');
    expect(state.activeParameter).toBe('temperature');

    // Change parameter
    setActiveParameter('saturation');
    expect(useControlPanelStore.getState().activeParameter).toBe('saturation');

    // Switch to another module and back
    setActiveModule('texture');
    expect(useControlPanelStore.getState().activeModule).toBe('texture');
    expect(useControlPanelStore.getState().activeParameter).toBe('grain');

    setActiveModule('color');
    expect(useControlPanelStore.getState().activeModule).toBe('color');
    expect(useControlPanelStore.getState().activeParameter).toBe('saturation'); // Should be restored
  });

  it('sets active sub parameter and resets correctly', () => {
    const { setActiveDetailPanel, setActiveParameter, setActiveModule } = useControlPanelStore.getState();
    
    setActiveDetailPanel('grain_chroma');
    expect(useControlPanelStore.getState().activeDetailPanel).toBe('grain_chroma');

    // Reset on parameter change
    setActiveParameter('grain');
    expect(useControlPanelStore.getState().activeDetailPanel).toBe('none');

    setActiveDetailPanel('grain_size');
    expect(useControlPanelStore.getState().activeDetailPanel).toBe('grain_size');

    // Reset on module change
    setActiveModule('none');
    expect(useControlPanelStore.getState().activeDetailPanel).toBe('none');
  });

  it('memorizes last active module and parameter across section changes', () => {
    const { setActiveSection, setActiveModule, setActiveParameter } = useControlPanelStore.getState();

    // 1. Go to film section
    setActiveSection('film');
    expect(useControlPanelStore.getState().activeSection).toBe('film');
    expect(useControlPanelStore.getState().activeModule).toBe('tone');
    expect(useControlPanelStore.getState().activeParameter).toBe('contrast');

    // 2. Change module to texture and parameter to sharpening
    setActiveModule('texture');
    setActiveParameter('sharpening');
    expect(useControlPanelStore.getState().activeModule).toBe('texture');
    expect(useControlPanelStore.getState().activeParameter).toBe('sharpening');

    // 3. Switch to body section
    setActiveSection('body');
    expect(useControlPanelStore.getState().activeSection).toBe('body');
    expect(useControlPanelStore.getState().activeModule).toBe('exposure');

    // 4. Switch back to film section
    setActiveSection('film');
    expect(useControlPanelStore.getState().activeSection).toBe('film');
    expect(useControlPanelStore.getState().activeModule).toBe('texture');
    expect(useControlPanelStore.getState().activeParameter).toBe('sharpening');
  });

  it('updates isDetailPanelOpen correctly', () => {
    const { setIsDetailPanelOpen } = useControlPanelStore.getState();
    setIsDetailPanelOpen(true);
    expect(useControlPanelStore.getState().isDetailPanelOpen).toBe(true);
  });

  it('handles fallback values when unknown section or module is provided', () => {
    const { setActiveSection, setActiveModule } = useControlPanelStore.getState();
    setActiveSection('unknown_section' as any);
    expect(useControlPanelStore.getState().activeModule).toBe('none');
    expect(useControlPanelStore.getState().activeParameter).toBe('none');

    setActiveModule('unknown_module' as any);
    expect(useControlPanelStore.getState().activeParameter).toBe('none');
  });

  it('updates selectedColorIndex correctly via setter', () => {
    const { setSelectedColorIndex } = useControlPanelStore.getState();
    setSelectedColorIndex(4);
    expect(useControlPanelStore.getState().selectedColorIndex).toBe(4);
  });
});
