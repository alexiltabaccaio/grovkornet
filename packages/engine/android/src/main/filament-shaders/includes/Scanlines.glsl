// 4. Scanlines
vec3 applyScanlines(vec3 color, vec2 uv, vec2 res) {
    if (materialParams.u_Scanlines > 0.0) {
        float coord = (materialParams.u_ScanlinesHorizontal > 0.5) ? (uv.y * res.y) : (uv.x * res.x);
        float scanline = sin(coord * (materialParams.u_ScanlinesDensity / 1920.0)) * 0.16 * materialParams.u_Scanlines;
        return color - vec3(scanline);
    }
    return color;
}
