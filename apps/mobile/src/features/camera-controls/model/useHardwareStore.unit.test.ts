import { useHardwareStore } from './useHardwareStore';
import { DEFAULT_ISO, DEFAULT_EV, DEFAULT_SHUTTER_SPEED, DEFAULT_TEMPERATURE } from '@shared/constants/videoProcessing';

describe('useHardwareStore', () => {
  it('initializes correctly', () => {
    const state = useHardwareStore.getState();
    expect(state.iso.value).toBe(DEFAULT_ISO);
    expect(state.ev.value).toBe(DEFAULT_EV);
  });

  it('sets debug info correctly', () => {
    const store = useHardwareStore.getState();
    store.setDebugInfo(60, '1080p', 59);
    expect(useHardwareStore.getState().fps.value).toBe(60);
    expect(useHardwareStore.getState().resolution.value).toBe('1080p');
    expect(useHardwareStore.getState().hwFps.value).toBe(59);
  });

  it('sets ISO and updates auto flags', () => {
    const store = useHardwareStore.getState();
    store.setIso(800);
    expect(useHardwareStore.getState().iso.value).toBe(800);
    expect(useHardwareStore.getState().isoAuto.value).toBe(false);
    expect(useHardwareStore.getState().shutterSpeedAuto.value).toBe(false);
    expect(useHardwareStore.getState().evAuto.value).toBe(true);
    expect(useHardwareStore.getState().ev.value).toBe(DEFAULT_EV);
  });

  it('sets EV and updates auto flags', () => {
    const store = useHardwareStore.getState();
    store.setEv(1.5);
    expect(useHardwareStore.getState().ev.value).toBe(1.5);
    expect(useHardwareStore.getState().evAuto.value).toBe(false);
    expect(useHardwareStore.getState().isoAuto.value).toBe(true);
    expect(useHardwareStore.getState().shutterSpeedAuto.value).toBe(true);
  });

  it('sets Shutter Speed and updates auto flags', () => {
    const store = useHardwareStore.getState();
    store.setShutterSpeed(0.01);
    expect(useHardwareStore.getState().shutterSpeed.value).toBe(0.01);
    expect(useHardwareStore.getState().shutterSpeedAuto.value).toBe(false);
    expect(useHardwareStore.getState().isoAuto.value).toBe(false);
    expect(useHardwareStore.getState().evAuto.value).toBe(true);
    expect(useHardwareStore.getState().ev.value).toBe(DEFAULT_EV);
  });

  it('sets Temperature and updates auto flags', () => {
    const store = useHardwareStore.getState();
    store.setTemperature(5000);
    expect(useHardwareStore.getState().temperature.value).toBe(5000);
    expect(useHardwareStore.getState().temperatureAuto.value).toBe(false);
  });

  it('sets IsoAuto correctly', () => {
    const store = useHardwareStore.getState();
    store.setIsoAuto(true);
    expect(useHardwareStore.getState().isoAuto.value).toBe(true);
    expect(useHardwareStore.getState().shutterSpeedAuto.value).toBe(true);
    expect(useHardwareStore.getState().iso.value).toBe(DEFAULT_ISO);
    expect(useHardwareStore.getState().shutterSpeed.value).toBe(DEFAULT_SHUTTER_SPEED);

    store.setIsoAuto(false);
    expect(useHardwareStore.getState().isoAuto.value).toBe(false);
  });

  it('sets ShutterSpeedAuto correctly', () => {
    const store = useHardwareStore.getState();
    store.setShutterSpeedAuto(true);
    expect(useHardwareStore.getState().shutterSpeedAuto.value).toBe(true);
    expect(useHardwareStore.getState().isoAuto.value).toBe(true);
    expect(useHardwareStore.getState().shutterSpeed.value).toBe(DEFAULT_SHUTTER_SPEED);
    expect(useHardwareStore.getState().iso.value).toBe(DEFAULT_ISO);

    store.setShutterSpeedAuto(false);
    expect(useHardwareStore.getState().shutterSpeedAuto.value).toBe(false);
  });

  it('sets TemperatureAuto correctly', () => {
    const store = useHardwareStore.getState();
    store.setTemperatureAuto(true);
    expect(useHardwareStore.getState().temperatureAuto.value).toBe(true);
    expect(useHardwareStore.getState().temperature.value).toBe(DEFAULT_TEMPERATURE);

    store.setTemperatureAuto(false);
    expect(useHardwareStore.getState().temperatureAuto.value).toBe(false);
  });

  it('sets EvAuto correctly', () => {
    const store = useHardwareStore.getState();
    store.setEvAuto(true);
    expect(useHardwareStore.getState().evAuto.value).toBe(true);
    expect(useHardwareStore.getState().ev.value).toBe(DEFAULT_EV);

    store.setEvAuto(false);
    expect(useHardwareStore.getState().evAuto.value).toBe(false);
  });

  it('sets FocusDistance and FocusAuto', () => {
    const store = useHardwareStore.getState();
    store.setFocusDistance(0.5);
    expect(useHardwareStore.getState().focusDistance.value).toBe(0.5);
    expect(useHardwareStore.getState().focusAuto.value).toBe(false);

    store.setFocusAuto(true);
    expect(useHardwareStore.getState().focusAuto.value).toBe(true);
  });

  it('sets CameraId and CameraAuto', () => {
    const store = useHardwareStore.getState();
    store.setCameraId('cam-1');
    expect(useHardwareStore.getState().cameraId).toBe('cam-1');

    store.setCameraAuto(false);
    expect(useHardwareStore.getState().cameraAuto).toBe(false);
  });

  it('sets TorchState and TorchStrength', () => {
    const store = useHardwareStore.getState();
    store.setTorchState(1);
    expect(useHardwareStore.getState().torchState.value).toBe(1);

    store.setTorchStrength(0.8);
    expect(useHardwareStore.getState().torchStrength.value).toBe(0.8);
  });

  it('sets AspectRatio, ResolutionSetting, FpsSetting', () => {
    const store = useHardwareStore.getState();
    store.setAspectRatio(2);
    expect(useHardwareStore.getState().aspectRatio.value).toBe(2);

    store.setResolutionSetting(2);
    expect(useHardwareStore.getState().resolutionSetting.value).toBe(2);

    store.setFpsSetting(30);
    expect(useHardwareStore.getState().fpsSetting.value).toBe(30);
  });

  it('sets Capabilities and caps fpsSetting if needed', () => {
    const store = useHardwareStore.getState();
    store.setFpsSetting(60);
    store.setCapabilities({
      supportsFocus: true,
      hasTorch: true,
      maxTorchStrength: 1,
      isoMin: 100,
      isoMax: 3200,
      availableCameras: [],
      maxFps: 30, // < 60
    });
    expect(useHardwareStore.getState().capabilities.maxFps).toBe(30);
    expect(useHardwareStore.getState().fpsSetting.value).toBe(30);

    // Capabilities where maxFps is higher
    store.setCapabilities({
      supportsFocus: true,
      hasTorch: true,
      maxTorchStrength: 1,
      isoMin: 100,
      isoMax: 3200,
      availableCameras: [],
      maxFps: 120,
    });
    expect(useHardwareStore.getState().capabilities.maxFps).toBe(120);
  });
});
