#pragma once

struct RenderParams {
    float saturation;
    float contrast;
    float grainIntensity;
    float grainChroma;
    float grainSize;
    float grainSpeed;
    float vignetteIntensity;
    float vhsIntensity;
    float time;
    float ev;
    float whiteBalance;
    float tint;
    float bloomIntensity;
    float chromaticAberration;
    float aberrationDirection;
    float sharpening;
    float satRed;
    float satOrange;
    float satYellow;
    float satGreen;
    float satCyan;
    float satBlue;
    float satPurple;
    float satMagenta;
    float targetFps;
    float aspectRatio;
    float targetResolution;
};

RenderParams parseRenderParams(const float* params);
