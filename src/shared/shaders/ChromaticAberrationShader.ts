export const CHROMATIC_ABERRATION_SHADER = `
uniform shader image;
uniform vec2 resolution;
uniform float intensity;

vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 center = vec2(0.5);
    
    // Distance from the center (0.0 at center, ~0.707 at corners)
    float dist = distance(uv, center);
    
    // Direction from the center outwards
    vec2 dir = uv - center;
    
    // Effect strength: a value of 0.04 offers a good balance
    // at 100% it is visible, at 200% it is pronounced.
    float amount = dist * intensity * 0.04;
    
    // Sampling of the three channels with divergent offsets
    float r = image.eval(fragCoord + dir * amount * resolution).r;
    float g = image.eval(fragCoord).g;
    float b = image.eval(fragCoord - dir * amount * resolution).b;
    float a = image.eval(fragCoord).a;
    
    return vec4(r, g, b, a);
}
`;
