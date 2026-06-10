// 4. Scanlines
vec3 applyScanlines(vec3 color, vec2 uv, vec2 res) {
    if (materialParams.u_Scanlines > 0.0) {
        vec2 scaledUv = uv * (res / max(res.x, res.y));
        float coord = (materialParams.u_ScanlinesHorizontal > 0.5) ? scaledUv.y : scaledUv.x;
        float scanline = sin(coord * materialParams.u_ScanlinesDensity) * 0.16 * materialParams.u_Scanlines;
        return color - vec3(scanline);
    }
    return color;
}
