// Lens Distortion (barrel/pincushion)
vec2 applyLensDistortion(vec2 uv) {
    float distortion = materialParams.u_LensDistortion;
    if (distortion == 0.0) {
        return uv;
    }
    
    // Map to [-1, 1] coordinate system
    vec2 coord = uv * 2.0 - 1.0;
    
    // Radial distance squared
    float r2 = dot(coord, coord);
    
    // Calculate scale factor
    float scale;
    if (distortion > 0.0) {
        // Pincushion (+): perfect crop to eliminate stretched edge artifacts (r2 = 2.0)
        scale = 1.0 / (1.0 + distortion * 2.0);
    } else {
        // Barrel (-): use original heuristic to avoid infinite shrinking
        scale = 1.0 / (1.0 + distortion * 0.4);
    }
    
    // Warp coord
    coord = coord * (1.0 + distortion * r2) * scale;
    
    // Map back to [0, 1]
    return coord * 0.5 + 0.5;
}
