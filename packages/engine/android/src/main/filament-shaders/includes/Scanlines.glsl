// 4. Scanlines
vec3 applyScanlines(vec3 color, vec2 uv) {
    if (materialParams.u_Scanlines > 0.0) {
        float scanline = sin(uv.y * 800.0) * 0.16 * materialParams.u_Scanlines;
        return color - vec3(scanline);
    }
    return color;
}
