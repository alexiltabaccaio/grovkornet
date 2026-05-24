import { renderHook } from '@testing-library/react-native';
import { useFilmWorklets } from './useFilmWorklets';
import { useFilmStore } from '../model/useFilmStore';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION, 
  DEFAULT_CONTRAST, 
  DEFAULT_CHROMATIC_ABERRATION,
  DEFAULT_GRAIN_SPEED,
} from '@grovkornet/shared';

describe('useFilmWorklets', () => {
  beforeEach(() => {
    // Reset film store values
    const film = useFilmStore.getState();
    film.setGrainIntensity(DEFAULT_GRAIN_INTENSITY);
    film.setGrainChroma(0);
    film.setGrainSize(1);
    film.setGrainSpeed(DEFAULT_GRAIN_SPEED);
    film.setSaturation(DEFAULT_SATURATION);
    film.setContrast(DEFAULT_CONTRAST);
    film.setChromaticAberration(DEFAULT_CHROMATIC_ABERRATION);
    film.setAberrationDirection(0);
    film.setSharpening(0);
    film.setBloomIntensity(0);
    film.setTemperatureAuto(true);
    film.resetEffect('saturation');
  });

  it('correctly updates grain parameters in worklets', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    // Test updateGrain
    worklets.updateGrain(1.5);
    expect(useFilmStore.getState().grainIntensity.value).toBe(1.5);
    expect(useFilmStore.getState().grainEnabled.value).toBe(true);

    // Test clamping in updateGrain
    worklets.updateGrain(3.0);
    expect(useFilmStore.getState().grainIntensity.value).toBe(2.0);

    worklets.updateGrain(-0.5);
    expect(useFilmStore.getState().grainIntensity.value).toBe(0.0);
    expect(useFilmStore.getState().grainEnabled.value).toBe(false);

    // Test chroma, size, speed
    worklets.updateGrainChroma(0.5);
    expect(useFilmStore.getState().grainChroma.value).toBe(0.5);

    worklets.updateGrainSize(1.2);
    expect(useFilmStore.getState().grainSize.value).toBe(1.2);

    worklets.updateGrainSpeed(0.8);
    expect(useFilmStore.getState().grainSpeed.value).toBe(0.8);
  });

  it('correctly updates color and contrast parameters in worklets', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    worklets.updateSaturation(1.4);
    expect(useFilmStore.getState().saturation.value).toBe(1.4);

    worklets.updateContrast(1.2);
    expect(useFilmStore.getState().contrast.value).toBe(1.2);
  });

  it('correctly updates selective saturation parameters in worklets', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    worklets.updateSatRed(12.3);
    worklets.updateSatOrange(45.6);
    worklets.updateSatYellow(78.9);
    worklets.updateSatGreen(10.0);
    worklets.updateSatCyan(20.0);
    worklets.updateSatBlue(30.0);
    worklets.updateSatPurple(40.0);
    worklets.updateSatMagenta(50.0);

    expect(useFilmStore.getState().satRed.value).toBe(12.3);
    expect(useFilmStore.getState().satOrange.value).toBe(45.6);
    expect(useFilmStore.getState().satYellow.value).toBe(78.9);
    expect(useFilmStore.getState().satGreen.value).toBe(10.0);
    expect(useFilmStore.getState().satCyan.value).toBe(20.0);
    expect(useFilmStore.getState().satBlue.value).toBe(30.0);
    expect(useFilmStore.getState().satPurple.value).toBe(40.0);
    expect(useFilmStore.getState().satMagenta.value).toBe(50.0);
  });

  it('correctly updates chromatic aberration parameters in worklets', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    worklets.updateChromaticAberration(0.15);
    expect(useFilmStore.getState().chromaticAberration.value).toBe(0.15);

    worklets.updateAberrationDirection(2);
    expect(useFilmStore.getState().aberrationDirection.value).toBe(2);
  });

  it('correctly updates temperature and tint parameters, disabling auto mode', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    worklets.updateTemperature(5500);
    expect(useFilmStore.getState().temperature.value).toBe(5500);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);

    // reset auto for tint test
    useFilmStore.getState().setTemperatureAuto(true);
    worklets.updateTint(15);
    expect(useFilmStore.getState().tint.value).toBe(15);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(false);
  });

  it('correctly updates sharpening in worklets', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    worklets.updateSharpening(0.4);
    expect(useFilmStore.getState().sharpening.value).toBe(0.4);
  });

  it('correctly updates bloom intensity and related state', () => {
    const { result } = renderHook(() => useFilmWorklets());
    const worklets = result.current;

    worklets.updateBloomIntensity(0.7);
    expect(useFilmStore.getState().bloomIntensity.value).toBe(0.7);
    expect(useFilmStore.getState().bloomEnabled.value).toBe(true);

    worklets.updateBloomIntensity(-0.2);
    expect(useFilmStore.getState().bloomIntensity.value).toBe(0.0);
    expect(useFilmStore.getState().bloomEnabled.value).toBe(false);
  });
});
