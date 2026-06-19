// 2. Chromatic aberration, shift and tape jitter logic
void computeChromaUvs(vec2 uv, vec2 res, out vec2 rUv, out vec2 gUv, out vec2 bUv, out vec2 compositeUv) {
    // Zoom in slightly to hide edge clamping artifacts when shifting UVs
    float maxShift = 0.0;
    if (materialParams.u_ChromaShift > 0.0) maxShift += 0.02 * materialParams.u_ChromaShift;
    if (materialParams.u_ChromaticAberration > 0.0) maxShift += 0.02 * materialParams.u_ChromaticAberration;
    if (materialParams.u_TapeJitter > 0.0) maxShift += 0.002 * materialParams.u_TapeJitter;

    if (maxShift > 0.0) {
        float aspect = res.x / res.y;
        // Divide maxShift by u_DrsScale so that when resolution is downscaled, 
        // the padding remains absolute in texture space.
        float padding = maxShift / max(0.1, materialParams.u_DrsScale);
        float uniformScale = 1.0 - (2.0 * padding * max(1.0, aspect));
        uv = (uv - 0.5) * uniformScale + 0.5;
    }

    compositeUv = uv * materialParams.u_DrsScale;
    rUv = compositeUv;
    gUv = compositeUv;
    bUv = compositeUv;

    if (materialParams.u_TapeJitter > 0.0) {
        float jitter = sin(uv.y * 50.0 + materialParams.u_Time * 10.0) * 0.002 * materialParams.u_TapeJitter;
        compositeUv.x += jitter;
        rUv.x += jitter;
        gUv.x += jitter;
        bUv.x += jitter;
    }

    if (materialParams.u_ChromaShift > 0.0) {
        float shift = 0.02 * materialParams.u_ChromaShift;
        if (materialParams.u_ChromaShiftInvert > 0.5) {
            shift = -shift;
        }
        if (materialParams.u_ChromaShiftDirection < 0.5) {
            rUv.x -= shift;
            bUv.x += shift;
        } else {
            float aspect = res.x / res.y;
            rUv.y -= shift * aspect;
            bUv.y += shift * aspect;
        }
    }

    if (materialParams.u_ChromaticAberration > 0.0) {
        float caIntensity = materialParams.u_ChromaticAberration * 0.02;
        float aspect = res.x / res.y;
        
        vec2 dir = normalize(uv - 0.5);
        float dist = length(uv - 0.5);
        float falloff = dist * dist * 4.0; // Caduta esponenziale per sweet-spot al centro
        vec2 caShift = dir * falloff * caIntensity;
        caShift.y *= aspect;
        
        if (materialParams.u_InvertYShift > 0.5) {
            caShift.y = -caShift.y;
        }

        if (materialParams.u_AberrationInvert > 0.5) {
            caShift = -caShift;
        }

        // Split Magenta/Verde per differenziarsi dallo shift Rosso/Ciano
        gUv += caShift;
        rUv -= caShift;
        bUv -= caShift;
    }
}
