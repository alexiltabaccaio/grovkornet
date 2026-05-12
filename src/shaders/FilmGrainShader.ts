export const FILM_GRAIN_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform float intensity;

float random(vec2 p) {
    // Magic numbers for pseudo-random noise
    vec2 K1 = vec2(12.9898, 78.233);
    return fract(sin(dot(p, K1)) * 43758.5453);
}

vec4 main(vec2 fragCoord) {
    // 1. Grain size
    float grainSize = 3.0;
    
    // 2. Create a block grid
    vec2 blockPos = floor(fragCoord.xy / grainSize);
    
    // 3. Generate noise
    float noise = random(blockPos + time);
    
    // 4. Contrast the noise
    noise = smoothstep(0.2, 0.8, noise);
    
    // 5. Apply the external intensity
    vec3 grainColor = vec3(noise);
    return vec4(grainColor * intensity, intensity);
}
`;
