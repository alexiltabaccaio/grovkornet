export const CHROMATIC_ABERRATION_SHADER = `
uniform shader image;
uniform vec2 resolution;
uniform float intensity;

vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 center = vec2(0.5);
    
    // Distanza dal centro (0.0 al centro, ~0.707 agli angoli)
    float dist = distance(uv, center);
    
    // Direzione dal centro verso l'esterno
    vec2 dir = uv - center;
    
    // Forza dell'effetto: un valore di 0.04 offre un buon bilanciamento
    // al 100% è visibile, al 200% è marcato.
    float amount = dist * intensity * 0.04;
    
    // Campionamento dei tre canali con offset divergenti
    float r = image.eval(fragCoord + dir * amount * resolution).r;
    float g = image.eval(fragCoord).g;
    float b = image.eval(fragCoord - dir * amount * resolution).b;
    float a = image.eval(fragCoord).a;
    
    return vec4(r, g, b, a);
}
`;
