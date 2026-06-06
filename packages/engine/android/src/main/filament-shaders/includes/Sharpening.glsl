// 3. Sharpening filter (Unsharp Mask for Detail Effect)
vec3 applySharpening(vec3 centerColor, vec2 compositeUv) {
    if (materialParams.u_Sharpening > 0.0) {
        // Raggio allargato per estrarre dettagli/strutture anziché rumore a singolo pixel.
        // Un offset di 1.5 sfrutta il filtro bilineare hardware per un fast blur efficiente.
        vec2 texel = materialParams.u_TexelSize * 1.5;
        
        vec3 colNW = textureLod(materialParams_u_Texture, compositeUv + vec2(-texel.x, texel.y), 0.0).rgb;
        vec3 colNE = textureLod(materialParams_u_Texture, compositeUv + vec2(texel.x, texel.y), 0.0).rgb;
        vec3 colSW = textureLod(materialParams_u_Texture, compositeUv + vec2(-texel.x, -texel.y), 0.0).rgb;
        vec3 colSE = textureLod(materialParams_u_Texture, compositeUv + vec2(texel.x, -texel.y), 0.0).rgb;
        
        // Fast blur usando 4 sample bilineari + il centro
        vec3 blurred = (centerColor * 4.0 + colNW + colNE + colSW + colSE) / 8.0;
        
        // High-pass: differenza tra originale e sfocato (dettaglio)
        vec3 detail = centerColor - blurred;
        
        // Maschera per evitare di esaltare il rumore nelle aree piatte
        // Soglie abbassate per evitare che la nitidezza scompaia con il motion blur (popping)
        float detailLuma = abs(dot(detail, vec3(0.299, 0.587, 0.114)));
        float mask = smoothstep(0.001, 0.008, detailLuma);
        
        return centerColor + detail * (materialParams.u_Sharpening * 12.0) * mask;
    }
    return centerColor;
}
