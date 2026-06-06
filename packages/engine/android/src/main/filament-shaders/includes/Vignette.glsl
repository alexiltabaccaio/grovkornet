// 5. Vignette
vec3 applyVignette(vec3 color, vec2 uv) {
    if (materialParams.u_VignetteIntensity > 0.0) {
        float d2 = dot(uv - 0.5, uv - 0.5);
        float vignette = 1.0 - (2.0 * d2) * materialParams.u_VignetteIntensity;
        return color * clamp(vignette, 0.0, 1.0);
    }
    return color;
}
