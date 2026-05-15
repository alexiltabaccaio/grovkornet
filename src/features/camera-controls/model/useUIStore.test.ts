import { useUIStore } from './useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    const state = useUIStore.getState();
    state.setActiveSection('none');
    state.setActiveModule('none');
    state.setActivePrimaryParameter('none');
    state.setActiveSubParameter('none');
    state.setIsDebugEnabled(false);

  });

  it('initializes with default values', () => {
    const state = useUIStore.getState();
    expect(state.activeSection).toBe('none');
    expect(state.activeModule).toBe('none');
    expect(state.activePrimaryParameter).toBe('none');
    expect(state.activeSubParameter).toBe('none');
  });


  it('sets active section correctly', () => {
    const { setActiveSection } = useUIStore.getState();
    setActiveSection('exposure');
    expect(useUIStore.getState().activeSection).toBe('exposure');
  });

  it('sets active module and restores last active primary parameter', () => {
    const { setActiveModule } = useUIStore.getState();
    
    // Set color_grading module (which has 'saturation' as default in lastActivePrimaryParameters)
    setActiveModule('color_grading');
    let state = useUIStore.getState();
    expect(state.activeModule).toBe('color_grading');
    expect(state.activePrimaryParameter).toBe('saturation');

    // Change parameter
    state.setActivePrimaryParameter('contrast');
    expect(useUIStore.getState().activePrimaryParameter).toBe('contrast');

    // Switch to another module and back
    setActiveModule('grain');
    expect(useUIStore.getState().activeModule).toBe('grain');
    expect(useUIStore.getState().activePrimaryParameter).toBe('grain');

    setActiveModule('color_grading');
    expect(useUIStore.getState().activeModule).toBe('color_grading');
    expect(useUIStore.getState().activePrimaryParameter).toBe('contrast'); // Should be restored
  });

  it('updates debug mode correctly', () => {
    const { setIsDebugEnabled } = useUIStore.getState();
    setIsDebugEnabled(true);
    expect(useUIStore.getState().isDebugEnabled).toBe(true);
  });

  it('sets active sub parameter and resets correctly', () => {
    const { setActiveSubParameter, setActivePrimaryParameter, setActiveModule } = useUIStore.getState();
    
    setActiveSubParameter('grain_chroma');
    expect(useUIStore.getState().activeSubParameter).toBe('grain_chroma');

    // Reset on primary parameter change
    setActivePrimaryParameter('grain');
    expect(useUIStore.getState().activeSubParameter).toBe('none');

    setActiveSubParameter('grain_size');
    expect(useUIStore.getState().activeSubParameter).toBe('grain_size');

    // Reset on module change
    setActiveModule('none');
    expect(useUIStore.getState().activeSubParameter).toBe('none');
  });
});

