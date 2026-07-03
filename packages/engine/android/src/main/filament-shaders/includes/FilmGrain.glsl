highp vec3 randVec3(highp vec2 co) {
    highp vec3 dots = vec3(
        dot(co, vec2(12.9898, 78.233)),
        dot(co, vec2(39.346, 11.135)),
        dot(co, vec2(73.156, 52.235))
    );
    return fract(sin(dots) * 43758.5453);
}

// 6. Procedural Film Grain
vec3 applyFilmGrain(vec3 color, vec2 uv) {
    if (materialParams.u_GrainIntensity > 0.0) {
        highp float size = materialParams.u_GrainSize;
        vec2 res = 1.0 / materialParams.u_TexelSize;
        vec2 scaledRes = res * (1080.0 / min(res.x, res.y));
        highp vec2 grainUv = floor(uv * (scaledRes / clamp(size, 0.1, 10.0))) * clamp(size, 0.1, 10.0) / scaledRes;
        
        highp vec3 rands = randVec3(grainUv);
        highp float t = materialParams.u_Time * materialParams.u_GrainSpeed;
        
        highp vec3 noise = fract(rands + t * vec3(0.11, 0.19, 0.33));
        highp vec3 monoFast = fract(rands + t * vec3(0.171, 0.180, 0.189));
        
        // MONO: soft (bell curve average - 0.5) vs rough (single channel - 0.5)
        highp float softMono = dot(monoFast, vec3(0.3333333)) - 0.5;
        highp float roughMono = monoFast.z - 0.5;
        highp float finalMono = mix(softMono, roughMono, materialParams.u_GrainRoughness);
        
        // RGB: soft (balanced chroma scaled by 1/sqrt(3)) vs rough (pure chroma)
        highp vec3 softRgb = (noise - 0.5) * 0.577350269;
        highp vec3 roughRgb = noise - 0.5;
        highp vec3 finalRgb = mix(softRgb, roughRgb, materialParams.u_GrainRoughness);
        
        // Blend MONO and RGB based on u_GrainChroma
        highp vec3 finalNoise = mix(vec3(finalMono), finalRgb, materialParams.u_GrainChroma);
        
        return color + finalNoise * materialParams.u_GrainIntensity;
    }
    return color;
}
