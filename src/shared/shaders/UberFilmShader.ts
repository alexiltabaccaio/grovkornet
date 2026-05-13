export const UBER_FILM_SHADER = `
uniform shader image;
uniform vec2 resolution;
uniform float time;

uniform float saturation;
uniform float contrast;
uniform float aberrationIntensity;
uniform float grainIntensity;
uniform float grainEnabled;

/* Random hash function for film grain */
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 main(vec2 fragCoord) {
    /* Base color sample */
    vec4 color = image.eval(fragCoord);
    
    /* 1. Chromatic Aberration */
    float safeAberration = min(aberrationIntensity, 1.999);
    float caAmount = safeAberration * 3.0;
    if (caAmount > 0.1) {
        float r = image.eval(vec2(fragCoord.x - caAmount, fragCoord.y)).r;
        float b = image.eval(vec2(fragCoord.x + caAmount, fragCoord.y)).b;
        color.r = r;
        color.b = b;
    }
    
    /* 2. Saturation and Contrast */
    const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);
    float luminance = dot(color.rgb, luminanceWeighting);
    color.rgb = mix(vec3(luminance), color.rgb, saturation);
    color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;
    
    /* 3. Film Grain (High Contrast B&W) */
    if (grainEnabled > 0.5 && grainIntensity > 0.0) {
        float noise = hash(fragCoord + vec2(time, time * 0.5));
        vec3 blend = vec3(noise);
        
        /* Overlay blend mode */
        vec3 overlay;
        overlay.r = color.r < 0.5 ? (2.0 * color.r * blend.r) : (1.0 - 2.0 * (1.0 - color.r) * (1.0 - blend.r));
        overlay.g = color.g < 0.5 ? (2.0 * color.g * blend.g) : (1.0 - 2.0 * (1.0 - color.g) * (1.0 - blend.g));
        overlay.b = color.b < 0.5 ? (2.0 * color.b * blend.b) : (1.0 - 2.0 * (1.0 - color.b) * (1.0 - blend.b));
        
        color.rgb = mix(color.rgb, overlay, grainIntensity * 2.0);
    }
    
    return color;
}
`;
