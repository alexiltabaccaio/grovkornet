import { useBodyStore } from './useBodyStore';
import { DEFAULT_ISO, DEFAULT_EV, DEFAULT_SHUTTER_SPEED, DEFAULT_ZOOM, DEFAULT_TORCH_STRENGTH } from '@grovkornet/shared';

describe('useBodyStore', () => {
  it('initializes correctly', () => {
    const state = useBodyStore.getState();
    expect(state.iso.value).toBe(DEFAULT_ISO);
    expect(state.ev.value).toBe(DEFAULT_EV);
    expect(state.zoom.value).toBe(DEFAULT_ZOOM);
  });

  it('sets zoom correctly', () => {
    const store = useBodyStore.getState();
    store.setZoom(2.5);
    expect(useBodyStore.getState().zoom.value).toBe(2.5);
  });

  it('sets Capabilities and caps zoom if needed', () => {
    const store = useBodyStore.getState();
    store.setZoom(5.0);
    store.setCapabilities({
      minZoom: 1.0,
      maxZoom: 4.0,
    });
    expect(useBodyStore.getState().zoom.value).toBe(4.0);

    store.setZoom(0.5);
    store.setCapabilities({
      minZoom: 1.5,
      maxZoom: 4.0,
    });
    expect(useBodyStore.getState().zoom.value).toBe(1.5);
  });

  it('sets Capabilities and caps fpsSetting if needed', () => {
    const store = useBodyStore.getState();
    store.setFpsSetting(60);
    store.setCapabilities({
      hasTorch: true,
      maxTorchStrength: 1,
      isoMin: 100,
      isoMax: 3200,
      maxFps: 30, // < 60
    });
    expect(useBodyStore.getState().capabilities.maxFps).toBe(30);
    expect(useBodyStore.getState().fpsSetting.value).toBe(30);

    // Capabilities where maxFps is higher
    store.setCapabilities({
      hasTorch: true,
      maxTorchStrength: 1,
      isoMin: 100,
      isoMax: 3200,
      maxFps: 120,
    });
    expect(useBodyStore.getState().capabilities.maxFps).toBe(120);
  });

  it('sets debug info correctly', () => {
    const store = useBodyStore.getState();
    store.setDebugInfo(60, '1080p', 59);
    expect(useBodyStore.getState().fps.value).toBe(60);
    expect(useBodyStore.getState().resolution.value).toBe('1080p');
    expect(useBodyStore.getState().hwFps.value).toBe(59);
  });

  it('sets ISO and updates auto flags', () => {
    const store = useBodyStore.getState();
    store.setIso(800);
    expect(useBodyStore.getState().iso.value).toBe(800);
    expect(useBodyStore.getState().isoAuto.value).toBe(false);
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(false);
    expect(useBodyStore.getState().evAuto.value).toBe(true);
    expect(useBodyStore.getState().ev.value).toBe(DEFAULT_EV);
  });

  it('sets EV and updates auto flags', () => {
    const store = useBodyStore.getState();
    store.setEv(1.5);
    expect(useBodyStore.getState().ev.value).toBe(1.5);
    expect(useBodyStore.getState().evAuto.value).toBe(false);
    expect(useBodyStore.getState().isoAuto.value).toBe(true);
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(true);
  });

  it('sets Shutter Speed and updates auto flags', () => {
    const store = useBodyStore.getState();
    store.setShutterSpeed(0.01);
    expect(useBodyStore.getState().shutterSpeed.value).toBe(0.01);
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(false);
    expect(useBodyStore.getState().isoAuto.value).toBe(false);
    expect(useBodyStore.getState().evAuto.value).toBe(true);
    expect(useBodyStore.getState().ev.value).toBe(DEFAULT_EV);
  });

  it('sets IsoAuto correctly', () => {
    const store = useBodyStore.getState();
    store.setIsoAuto(true);
    expect(useBodyStore.getState().isoAuto.value).toBe(true);
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(true);
    expect(useBodyStore.getState().iso.value).toBe(DEFAULT_ISO);
    expect(useBodyStore.getState().shutterSpeed.value).toBe(DEFAULT_SHUTTER_SPEED);

    store.setIsoAuto(false);
    expect(useBodyStore.getState().isoAuto.value).toBe(false);
  });

  it('sets ShutterSpeedAuto correctly', () => {
    const store = useBodyStore.getState();
    store.setShutterSpeedAuto(true);
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(true);
    expect(useBodyStore.getState().isoAuto.value).toBe(true);
    expect(useBodyStore.getState().shutterSpeed.value).toBe(DEFAULT_SHUTTER_SPEED);
    expect(useBodyStore.getState().iso.value).toBe(DEFAULT_ISO);

    store.setShutterSpeedAuto(false);
    expect(useBodyStore.getState().shutterSpeedAuto.value).toBe(false);
  });

  it('sets EvAuto correctly', () => {
    const store = useBodyStore.getState();
    store.setEvAuto(true);
    expect(useBodyStore.getState().evAuto.value).toBe(true);
    expect(useBodyStore.getState().ev.value).toBe(DEFAULT_EV);

    store.setEvAuto(false);
    expect(useBodyStore.getState().evAuto.value).toBe(false);
  });

  it('sets TorchState and TorchStrength', () => {
    const store = useBodyStore.getState();
    store.setTorchState(1);
    expect(useBodyStore.getState().torchState.value).toBe(1);

    store.setTorchStrength(0.8);
    expect(useBodyStore.getState().torchStrength.value).toBe(0.8);
  });

  it('sets AspectRatio, ResolutionSetting, FpsSetting', () => {
    const store = useBodyStore.getState();
    store.setAspectRatio(2);
    expect(useBodyStore.getState().aspectRatio.value).toBe(2);

    store.setResolutionSetting(2);
    expect(useBodyStore.getState().resolutionSetting.value).toBe(2);

    store.setFpsSetting(30);
    expect(useBodyStore.getState().fpsSetting.value).toBe(30);

    store.setPreviewQuality(1);
    expect(useBodyStore.getState().previewQuality.value).toBe(1);
  });

  it('sets Capabilities and caps fpsSetting if needed', () => {
    const store = useBodyStore.getState();
    store.setFpsSetting(60);
    store.setCapabilities({
      hasTorch: true,
      maxTorchStrength: 1,
      isoMin: 100,
      isoMax: 3200,
      maxFps: 30, // < 60
    });
    expect(useBodyStore.getState().capabilities.maxFps).toBe(30);
    expect(useBodyStore.getState().fpsSetting.value).toBe(30);

    // Capabilities where maxFps is higher
    store.setCapabilities({
      hasTorch: true,
      maxTorchStrength: 1,
      isoMin: 100,
      isoMax: 3200,
      maxFps: 120,
    });
    expect(useBodyStore.getState().capabilities.maxFps).toBe(120);
  });

  it('resets parameters correctly using resetParameter', () => {
    const store = useBodyStore.getState();

    const spyEv = jest.spyOn(store, 'setEvAuto');
    const spyIso = jest.spyOn(store, 'setIsoAuto');
    const spyShutter = jest.spyOn(store, 'setShutterSpeedAuto');
    const spyTorchState = jest.spyOn(store, 'setTorchState');
    const spyTorchStrength = jest.spyOn(store, 'setTorchStrength');
    const spyFpsSetting = jest.spyOn(store, 'setFpsSetting');

    expect(store.resetParameter('ev')).toBe(true);
    expect(spyEv).toHaveBeenCalledWith(true);

    expect(store.resetParameter('iso')).toBe(true);
    expect(spyIso).toHaveBeenCalledWith(true);

    expect(store.resetParameter('shutter_speed')).toBe(true);
    expect(spyShutter).toHaveBeenCalledWith(true);

    expect(store.resetParameter('torch')).toBe(true);
    expect(spyTorchState).toHaveBeenCalledWith(0);
    expect(spyTorchStrength).toHaveBeenCalledWith(DEFAULT_TORCH_STRENGTH);

    expect(store.resetParameter('torch_strength')).toBe(true);
    expect(spyTorchStrength).toHaveBeenLastCalledWith(DEFAULT_TORCH_STRENGTH);

    store.setCapabilities({ maxFps: 60 });
    expect(store.resetParameter('fps_setting')).toBe(true);
    expect(spyFpsSetting).toHaveBeenCalledWith(60);

    expect(store.resetParameter('focus' as any)).toBe(false);

    spyEv.mockRestore();
    spyIso.mockRestore();
    spyShutter.mockRestore();
    spyTorchState.mockRestore();
    spyTorchStrength.mockRestore();
    spyFpsSetting.mockRestore();
  });
});
