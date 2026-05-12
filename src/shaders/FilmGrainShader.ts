export const FILM_GRAIN_SHADER = `
uniform float time;
uniform vec2 resolution;
uniform float intensity;

float random(vec2 p) {
    // Numeri magici per un rumore pseudo-casuale
    vec2 K1 = vec2(12.9898, 78.233);
    return fract(sin(dot(p, K1)) * 43758.5453);
}

vec4 main(vec2 fragCoord) {
    // 1. Spessore della grana
    float grainSize = 3.0;
    
    // 2. Creiamo una griglia a blocchi
    vec2 blockPos = floor(fragCoord.xy / grainSize);
    
    // 3. Generiamo il rumore
    float noise = random(blockPos + time);
    
    // 4. Contrastiamo il rumore
    noise = smoothstep(0.2, 0.8, noise);
    
    // 5. Applichiamo l'intensità passata dall'esterno
    vec3 grainColor = vec3(noise);
    return vec4(grainColor * intensity, intensity);
}
`;
