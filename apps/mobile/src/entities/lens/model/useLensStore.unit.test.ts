import { useLensStore } from './useLensStore';

describe('useLensStore', () => {
  beforeEach(() => {
    useLensStore.setState({
      cameraId: '',
      cameraAuto: true,
      capabilities: {
        supportsFocus: true,
        availableCameras: [],
      },
    });
    useLensStore.getState().focusDistance.value = 0;
    useLensStore.getState().focusAuto.value = true;
  });

  it('initializes with default values', () => {
    const state = useLensStore.getState();
    expect(state.focusDistance.value).toBe(0);
    expect(state.focusAuto.value).toBe(true);
    expect(state.cameraId).toBe('');
    expect(state.cameraAuto).toBe(true);
    expect(state.capabilities.supportsFocus).toBe(true);
    expect(state.capabilities.availableCameras).toEqual([]);
  });

  it('sets focus distance and turns off autofocus', () => {
    const store = useLensStore.getState();
    store.setFocusDistance(0.5);
    expect(useLensStore.getState().focusDistance.value).toBe(0.5);
    expect(useLensStore.getState().focusAuto.value).toBe(false);
  });

  it('sets autofocus auto status correctly', () => {
    const store = useLensStore.getState();
    store.setFocusAuto(false);
    expect(useLensStore.getState().focusAuto.value).toBe(false);

    store.setFocusAuto(true);
    expect(useLensStore.getState().focusAuto.value).toBe(true);
  });

  it('sets camera ID correctly', () => {
    const store = useLensStore.getState();
    store.setCameraId('camera_1');
    expect(useLensStore.getState().cameraId).toBe('camera_1');
  });

  it('sets camera auto status correctly', () => {
    const store = useLensStore.getState();
    store.setCameraAuto(false);
    expect(useLensStore.getState().cameraAuto).toBe(false);

    store.setCameraAuto(true);
    expect(useLensStore.getState().cameraAuto).toBe(true);
  });

  it('sets capabilities correctly', () => {
    const store = useLensStore.getState();
    const availableCameras = [
      { id: '0', focalLength: 24, focalLength35mm: 24 },
      { id: '1', focalLength: 50, focalLength35mm: 50 },
    ];
    store.setCapabilities({
      supportsFocus: false,
      availableCameras,
    });
    expect(useLensStore.getState().capabilities.supportsFocus).toBe(false);
    expect(useLensStore.getState().capabilities.availableCameras).toEqual(availableCameras);
  });
});
