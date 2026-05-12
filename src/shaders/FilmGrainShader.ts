export const FILM_GRAIN_SHADER = `
uniform float time;
uniform vec2 resolution;

float random(vec2 p) {
    vec2 K1 = vec2(
        23.14069263277926, // e^pi (Gelfond's constant)
         2.665144142690225 // 2^sqrt(2) (Gelfond-Schneider constant)
    );
    return fract( cos( dot(p,K1) ) * 12345.6789 );
}

vec4 main(vec2 fragCoord) {
    // Calcola le coordinate UV normalizzate
    vec2 uv = fragCoord.xy / resolution.xy;
    
    // Genera rumore casuale basato sulle coordinate e sul tempo
    // Moltiplicare le coordinate crea una "grana" più o meno spessa
    float noise = random(uv * 1000.0 + time);
    
    // Crea un colore grigio con il rumore applicato
    // Il rumore va da 0.0 a 1.0. Lo riduciamo per non accecare l'immagine.
    float intensity = 0.35; // Regola questo per una grana più spessa/evidente
    
    return vec4(vec3(noise), intensity);
}
`;
