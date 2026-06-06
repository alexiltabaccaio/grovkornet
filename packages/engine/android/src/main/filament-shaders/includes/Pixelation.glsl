// 1. Pixelation and DRS logic
vec2 applyPixelation(vec2 uv, vec2 res, float minDim) {
    vec2 targetUv = uv;
    if (materialParams.u_TargetResolution > 0.0) {
        if (materialParams.u_TargetResolution < minDim) {
            float scale = materialParams.u_TargetResolution / minDim;
            vec2 gridSize = res * scale;
            targetUv = (floor(targetUv * gridSize) + 0.5) / gridSize;
        }
    }

    if (materialParams.u_PixelationFactor > 1.0) {
        float scaledFactor = max(1.0, materialParams.u_PixelationFactor * (minDim / 1080.0));
        vec2 gridSize = res / scaledFactor;
        targetUv = (floor(targetUv * gridSize) + 0.5) / gridSize;
    }
    return targetUv;
}
