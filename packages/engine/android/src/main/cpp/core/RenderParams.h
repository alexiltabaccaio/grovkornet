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
    float invertYShift;
    float aberrationInvert;
    float boundMagentaRed;
    float boundRedOrange;
    float boundOrangeYellow;
    float boundYellowGreen;
    float boundGreenCyan;
    float boundCyanBlue;
    float boundBluePurple;
    float boundPurpleMagenta;
};

RenderParams parseRenderParams(const float* params);
