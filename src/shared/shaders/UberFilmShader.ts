export const UBER_FILM_SHADER = `
uniform shader image;
uniform vec2 resolution;
uniform float time;

// Color Uniforms
uniform float saturation;
uniform float contrast;

// Effect Uniforms
uniform float aberrationIntensity;
uniform float grainIntensity;
uniform float grainEnabled;

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 center = vec2(0.5);
    vec2 dir = uv - center;
    float dist = distance(uv, center);
    
    // 1. Chromatic Aberration (Spatial Sampling)
    float amount = dist * aberrationIntensity * 0.04;
    float r = image.eval(fragCoord + dir * amount * resolution).r;
    float g = image.eval(fragCoord).g;
    float b = image.eval(fragCoord - dir * amount * resolution).b;
    float a = image.eval(fragCoord).a;
    
    vec4 color = vec4(r, g, b, a);
    
    // 2. Saturation
    float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luma), color.rgb, saturation);
    
    // 3. Contrast
    color.rgb = (color.rgb - 0.5) * contrast + 0.5;
    
    // 4. Film Grain (Procedural Noise)
    if (grainEnabled > 0.5) {
        float grainSize = 3.0;
        float noise = random(floor(fragCoord.xy / grainSize) + time);
        noise = smoothstep(0.2, 0.8, noise);
        
        // Overlay Blend Mode math
        vec3 grainRes;
        if (noise < 0.5) {
            grainRes = 2.0 * color.rgb * noise;
        } else {
            grainRes = 1.0 - 2.0 * (1.0 - color.rgb) * (1.0 - noise);
        }
        color.rgb = mix(color.rgb, grainRes, grainIntensity);
    }
    
    return color;
}
`;
