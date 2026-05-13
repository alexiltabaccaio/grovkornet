import { UBER_FILM_SHADER } from './UberFilmShader';

describe('UberFilmShader', () => {
  it('should export a valid shader string', () => {
    expect(typeof UBER_FILM_SHADER).toBe('string');
    expect(UBER_FILM_SHADER.length).toBeGreaterThan(0);
  });

  it('should contain all required uniforms', () => {
    const requiredUniforms = [
      'uniform shader image',
      'uniform vec2 resolution',
      'uniform float time',
      'uniform float saturation',
      'uniform float contrast',
      'uniform float aberrationIntensity',
      'uniform float grainIntensity',
      'uniform float grainEnabled',
    ];

    requiredUniforms.forEach(uniform => {
      expect(UBER_FILM_SHADER).toContain(uniform);
    });
  });

  it('should have a main function', () => {
    expect(UBER_FILM_SHADER).toContain('vec4 main(vec2 fragCoord)');
  });
});
