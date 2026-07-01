// 3. Sharpening filter (Unsharp Mask for Detail Effect)
vec3 applySharpening(vec3 centerColor, vec2 compositeUv) {
    if (materialParams.u_Sharpening > 0.0) {
        // Wider radius to extract details/structures instead of single-pixel noise.
        // An offset of 1.5 leverages the hardware bilinear filter for an efficient fast blur.
        vec2 texel = materialParams.u_TexelSize * 1.5;
        
        vec3 colNW = textureLod(materialParams_u_Texture, compositeUv + vec2(-texel.x, texel.y), 0.0).rgb;
        vec3 colNE = textureLod(materialParams_u_Texture, compositeUv + vec2(texel.x, texel.y), 0.0).rgb;
        vec3 colSW = textureLod(materialParams_u_Texture, compositeUv + vec2(-texel.x, -texel.y), 0.0).rgb;
        vec3 colSE = textureLod(materialParams_u_Texture, compositeUv + vec2(texel.x, -texel.y), 0.0).rgb;
        
        // Fast blur using 4 bilinear samples + the center
        vec3 blurred = (centerColor * 4.0 + colNW + colNE + colSW + colSE) / 8.0;
        
        // High-pass: difference between original and blurred (detail)
        vec3 detail = centerColor - blurred;
        
        // Mask to avoid enhancing noise in flat areas
        // Lowered thresholds to prevent sharpness from disappearing with motion blur (popping)
        float detailLuma = abs(dot(detail, vec3(0.299, 0.587, 0.114)));
        float mask = smoothstep(0.001, 0.008, detailLuma);
        
        return centerColor + detail * (materialParams.u_Sharpening * 12.0) * mask;
    }
    return centerColor;
}
