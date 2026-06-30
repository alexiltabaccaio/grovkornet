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
            if (materialParams.u_InvertYShift > 0.5) {
                shift = -shift;
            }
            rUv.y -= shift * aspect;
            bUv.y += shift * aspect;
        }
    }

    if (materialParams.u_ChromaticAberration > 0.0) {
        float caIntensity = materialParams.u_ChromaticAberration * 0.02;
        float aspect = res.x / res.y;
        
        vec2 dir = normalize(uv - 0.5);
        float dist = length(uv - 0.5);
        float falloff = dist * dist * 4.0; // Exponential falloff for sweet-spot at the center
        vec2 caShift = dir * falloff * caIntensity;
        caShift.y *= aspect;
        
        if (materialParams.u_AberrationInvert > 0.5) {
            caShift = -caShift;
        }

        // Magenta/Green split to differentiate from Red/Cyan shift
        gUv += caShift;
        rUv -= caShift;
        bUv -= caShift;
    }
}

vec3 rgb2yiq(vec3 c) {
    return vec3(
        dot(c, vec3(0.299, 0.587, 0.114)),
        dot(c, vec3(0.5959, -0.2741, -0.3218)),
        dot(c, vec3(0.2115, -0.5229, 0.3114))
    );
}

vec3 yiq2rgb(vec3 c) {
    return vec3(
        dot(c, vec3(1.0, 0.956, 0.621)),
        dot(c, vec3(1.0, -0.272, -0.647)),
        dot(c, vec3(1.0, -1.106, 1.703))
    );
}

vec3 applyChromaBleed(vec3 centerColor, vec2 uv) {
    if (materialParams.u_ChromaBleed <= 0.0) {
        return centerColor;
    }
    
    // Scale blur to max ~30 reference pixels for a pronounced VHS bleed effect
    // Using 1080.0 as a reference resolution ensures the bleed radius is
    // resolution-independent and visually identical between preview and photo capture.
    float blurRadius = materialParams.u_ChromaBleed * 30.0;
    float stepX = blurRadius / 1080.0;
    
    vec3 centerYiq = rgb2yiq(centerColor);
    vec3 yiqSum = vec3(0.0);
    
    // Trailing blur: sample only pixels to the left (negative offset)
    // so that the color bleeds to the right.
    
    // Sample offset -4
    vec3 colM4 = texture(materialParams_u_Texture, uv - vec2(4.0 * stepX, 0.0)).rgb;
    yiqSum += rgb2yiq(colM4) * 0.0625;
    
    // Sample offset -3
    vec3 colM3 = texture(materialParams_u_Texture, uv - vec2(3.0 * stepX, 0.0)).rgb;
    yiqSum += rgb2yiq(colM3) * 0.125;
    
    // Sample offset -2
    vec3 colM2 = texture(materialParams_u_Texture, uv - vec2(2.0 * stepX, 0.0)).rgb;
    yiqSum += rgb2yiq(colM2) * 0.25;
    
    // Sample offset -1
    vec3 colM1 = texture(materialParams_u_Texture, uv - vec2(1.0 * stepX, 0.0)).rgb;
    yiqSum += rgb2yiq(colM1) * 0.25;
    
    // Center sample
    yiqSum += centerYiq * 0.3125;
    
    // Combine center Y with blurred I and Q
    vec3 finalYiq = vec3(centerYiq.r, yiqSum.g, yiqSum.b);
    
    return yiq2rgb(finalYiq);
}
