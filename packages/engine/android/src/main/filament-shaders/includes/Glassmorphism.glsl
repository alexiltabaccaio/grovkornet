// 7. Glassmorphism panel blend
vec3 applyGlassmorphism(vec3 color, vec2 uv, vec2 flippedBloomUv) {
    if (materialParams.u_PanelY < 1.0) {
        // Sample the pre-blurred glass texture
        vec3 glassColor = texture(materialParams_u_GlassTexture, flippedBloomUv).rgb;
        
        // Panel top Y coordinate (0.0 is top, 1.0 is bottom in Android Surface UV space)
        float panelTopY = materialParams.u_PanelY;
        
        // Antialiased edge transition: 1.0 for uv.y > panelTopY, 0.0 for uv.y < panelTopY
        float edgeSoftness = 0.002;
        float insidePanel = smoothstep(panelTopY - edgeSoftness, panelTopY + edgeSoftness, uv.y);
        
        return mix(color, glassColor, insidePanel);
    }
    return color;
}
