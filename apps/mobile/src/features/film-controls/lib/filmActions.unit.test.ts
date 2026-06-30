import { useFilmStore } from '@entities/film';
import { resetFilmParameter, resetFilmEffect } from './filmActions';
import { 
  DEFAULT_GRAIN_INTENSITY, 
  DEFAULT_SATURATION,
  DEFAULT_CHROMA_BLEED
} from '@grovkornet/shared';

describe('filmActions', () => {
  beforeEach(() => {
    // Reset film store values
    const store = useFilmStore.getState();
    store.setGrainIntensity(0.9);
    store.setSaturation(2.0);
    store.setContrast(2.0);
    store.setChromaticAberration(0.5);
    store.setChromaBleed(0.8);
  });

  it('resets parameters correctly using resetFilmParameter', () => {
    expect(resetFilmParameter('temperature')).toBe(true);
    expect(useFilmStore.getState().temperatureAuto.value).toBe(true);

    expect(resetFilmParameter('grain')).toBe(true);
    expect(useFilmStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);

    expect(resetFilmParameter('chroma_bleed')).toBe(true);
    expect(useFilmStore.getState().chromaBleed.value).toBe(DEFAULT_CHROMA_BLEED);

    expect(resetFilmParameter('ev' as any)).toBe(false);
  });

  it('resets film effects correctly using resetFilmEffect', () => {
    resetFilmEffect('grain');
    expect(useFilmStore.getState().grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
    expect(useFilmStore.getState().grainEnabled.value).toBe(false);

    resetFilmEffect('saturation');
    expect(useFilmStore.getState().saturation.value).toBe(DEFAULT_SATURATION);

    resetFilmEffect('chroma_bleed');
    expect(useFilmStore.getState().chromaBleed.value).toBe(DEFAULT_CHROMA_BLEED);
  });
});
