export const FILM_GRAIN_SHADER = `
uniform float time;
uniform vec2 resolution;

float random(vec2 p) {
    // Numeri magici per un rumore pseudo-casuale
    vec2 K1 = vec2(12.9898, 78.233);
    return fract(sin(dot(p, K1)) * 43758.5453);
}

vec4 main(vec2 fragCoord) {
    // 1. Spessore della grana (aumenta questo valore per grana più grossa)
    float grainSize = 3.0;
    
    // 2. Creiamo una griglia a blocchi basata sulla dimensione della grana.
    // Questo fa sì che pixel vicini abbiano lo stesso valore di rumore,
    // creando l'effetto "spesso" tipico della pellicola, invece di 1 solo pixel.
    vec2 blockPos = floor(fragCoord.xy / grainSize);
    
    // 3. Generiamo il rumore per questo blocco, usando il tempo per animarlo.
    // Il tempo deve variare per dare l'effetto sfarfallio.
    float noise = random(blockPos + time);
    
    // 4. Intensità dell'effetto grana
    float intensity = 0.4;
    
    // 5. Aumentiamo il contrasto del rumore per renderlo più "croccante"
    noise = smoothstep(0.2, 0.8, noise);
    
    // 6. Skia richiede l'alpha pre-moltiplicato: vec4(r*a, g*a, b*a, a)
    // Se non lo facciamo, il colore si miscela male diventando solo una patina grigia.
    vec3 grainColor = vec3(noise);
    return vec4(grainColor * intensity, intensity);
}
`;
