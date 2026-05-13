// Semplificato per testare la compatibilità del driver GPU in Release
export const UBER_FILM_SHADER = `
uniform shader image;
uniform vec2 resolution;
uniform float time;

// Parametri effettivi (verranno usati solo saturation e contrast per il test)
uniform float saturation;
uniform float contrast;
uniform float aberrationIntensity;
uniform float grainIntensity;
uniform float grainEnabled;

vec4 main(vec2 fragCoord) {
    vec4 color = image.eval(fragCoord);
    
    // Saturation & Contrast
    const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);
    float luminance = dot(color.rgb, luminanceWeighting);
    color.rgb = mix(vec3(luminance), color.rgb, saturation);
    color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;
    
    return color;
}
`;
