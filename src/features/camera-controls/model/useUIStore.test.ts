import { useUIStore } from './useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    const state = useUIStore.getState();
    state.setActiveTab('none');
    state.setActiveModule('none');
    state.setActiveParameter('none');
    state.setIsDebugEnabled(false);
  });

  it('initializes with default values', () => {
    const state = useUIStore.getState();
    expect(state.activeTab).toBe('none');
    expect(state.activeModule).toBe('none');
    expect(state.activeParameter).toBe('none');
  });

  it('sets active tab correctly', () => {
    const { setActiveTab } = useUIStore.getState();
    setActiveTab('exposure');
    expect(useUIStore.getState().activeTab).toBe('exposure');
  });

  it('sets active module and restores last active parameter', () => {
    const { setActiveModule } = useUIStore.getState();
    
    // Set color_grading module (which has 'saturation' as default in lastActiveParameters)
    setActiveModule('color_grading');
    let state = useUIStore.getState();
    expect(state.activeModule).toBe('color_grading');
    expect(state.activeParameter).toBe('saturation');

    // Change parameter
    state.setActiveParameter('contrast');
    expect(useUIStore.getState().activeParameter).toBe('contrast');

    // Switch to another module and back
    setActiveModule('grain');
    expect(useUIStore.getState().activeModule).toBe('grain');
    expect(useUIStore.getState().activeParameter).toBe('grain');

    setActiveModule('color_grading');
    expect(useUIStore.getState().activeModule).toBe('color_grading');
    expect(useUIStore.getState().activeParameter).toBe('contrast'); // Should be restored
  });

  it('updates debug mode correctly', () => {
    const { setIsDebugEnabled } = useUIStore.getState();
    setIsDebugEnabled(true);
    expect(useUIStore.getState().isDebugEnabled).toBe(true);
  });
});
