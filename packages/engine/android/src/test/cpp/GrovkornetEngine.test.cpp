#include <gtest/gtest.h>
#include "core/GrovkornetEngine.h"

TEST(GrovkornetEngineTest, BasicInitializationAndProperties) {
    GrovkornetEngine engine(640, 480);
    
    // Verify properties are set correctly
    EXPECT_EQ(engine.width, 640);
    EXPECT_EQ(engine.height, 480);
    EXPECT_EQ(engine.engine, nullptr);
    EXPECT_EQ(engine.renderer, nullptr);
    EXPECT_EQ(engine.view, nullptr);
}

TEST(GrovkornetEngineTest, ParseRenderParams_mapsArrayCorrectly) {
    float mockParams[50] = {
        1.2f,  // 0: saturation
        0.9f,  // 1: contrast
        0.5f,  // 2: grainIntensity
        0.3f,  // 3: grainChroma
        1.1f,  // 4: grainSize
        2.0f,  // 5: grainSpeed
        0.15f, // 6: vignetteIntensity
        0.7f,  // 7: chromaShift
        123.45f, // 8: time
        -0.5f, // 9: ev
        5500.0f, // 10: whiteBalance
        5.0f,    // 11: tint
        0.4f,  // 12: bloomIntensity
        0.1f,  // 13: chromaticAberration
        1.0f,  // 14: chromaShiftDirection
        0.8f,  // 15: sharpening
        45.0f,   // 16: satRed
        46.0f,   // 17: satOrange
        47.0f,   // 18: satYellow
        48.0f,   // 19: satGreen
        49.0f,   // 20: satCyan
        51.0f,   // 21: satBlue
        52.0f,   // 22: satPurple
        53.0f,   // 23: satMagenta
        30.0f,   // 24: targetFps
        2.0f,    // 25: aspectRatio
        1080.0f, // 26: targetResolution
        1.0f,    // 27: invertYShift
        0.0f,    // 28: aberrationInvert
        340.0f,  // 29: boundMagentaRed
        50.0f,   // 30: boundRedOrange
        85.0f,   // 31: boundOrangeYellow
        120.0f,  // 32: boundYellowGreen
        175.0f,  // 33: boundGreenCyan
        225.0f,  // 34: boundCyanBlue
        285.0f,  // 35: boundBluePurple
        310.0f,  // 36: boundPurpleMagenta
        0.7f,    // 37: grainRoughness
        0.85f,   // 38: panelY
        0.0f,    // 39: blackLevel
        1.0f,    // 40: highlights
        0.5f,    // 41: pivot
        1.0f,    // 42: contrastAuto
        1.0f,    // 43: blackLevelAuto
        1.0f,    // 44: highlightsAuto
        1.0f,    // 45: pivotAuto
        1.0f,    // 46: pixelationFactor
        0.2f,    // 47: tapeJitter
        0.3f,    // 48: scanlines
        1.0f     // 49: chromaShiftInvert
    };

    RenderParams rp = parseRenderParams(mockParams);

    EXPECT_FLOAT_EQ(rp.saturation, 1.2f);
    EXPECT_FLOAT_EQ(rp.contrast, 0.9f);
    EXPECT_FLOAT_EQ(rp.grainIntensity, 0.5f);
    EXPECT_FLOAT_EQ(rp.grainChroma, 0.3f);
    EXPECT_FLOAT_EQ(rp.grainSize, 1.1f);
    EXPECT_FLOAT_EQ(rp.grainSpeed, 2.0f);
    EXPECT_FLOAT_EQ(rp.vignetteIntensity, 0.15f);
    EXPECT_FLOAT_EQ(rp.chromaShift, 0.7f);
    EXPECT_FLOAT_EQ(rp.time, 123.45f);
    EXPECT_FLOAT_EQ(rp.ev, -0.5f);
    EXPECT_FLOAT_EQ(rp.whiteBalance, 5500.0f);
    EXPECT_FLOAT_EQ(rp.tint, 5.0f);
    EXPECT_FLOAT_EQ(rp.bloomIntensity, 0.4f);
    EXPECT_FLOAT_EQ(rp.chromaticAberration, 0.1f);
    EXPECT_FLOAT_EQ(rp.chromaShiftDirection, 1.0f);
    EXPECT_FLOAT_EQ(rp.sharpening, 0.8f);
    EXPECT_FLOAT_EQ(rp.satRed, 45.0f);
    EXPECT_FLOAT_EQ(rp.satOrange, 46.0f);
    EXPECT_FLOAT_EQ(rp.satYellow, 47.0f);
    EXPECT_FLOAT_EQ(rp.satGreen, 48.0f);
    EXPECT_FLOAT_EQ(rp.satCyan, 49.0f);
    EXPECT_FLOAT_EQ(rp.satBlue, 51.0f);
    EXPECT_FLOAT_EQ(rp.satPurple, 52.0f);
    EXPECT_FLOAT_EQ(rp.satMagenta, 53.0f);
    EXPECT_FLOAT_EQ(rp.targetFps, 30.0f);
    EXPECT_FLOAT_EQ(rp.aspectRatio, 2.0f);
    EXPECT_FLOAT_EQ(rp.targetResolution, 1080.0f);
    EXPECT_FLOAT_EQ(rp.invertYShift, 1.0f);
    EXPECT_FLOAT_EQ(rp.aberrationInvert, 0.0f);
    EXPECT_FLOAT_EQ(rp.boundMagentaRed, 340.0f);
    EXPECT_FLOAT_EQ(rp.boundRedOrange, 50.0f);
    EXPECT_FLOAT_EQ(rp.boundOrangeYellow, 85.0f);
    EXPECT_FLOAT_EQ(rp.boundYellowGreen, 120.0f);
    EXPECT_FLOAT_EQ(rp.boundGreenCyan, 175.0f);
    EXPECT_FLOAT_EQ(rp.boundCyanBlue, 225.0f);
    EXPECT_FLOAT_EQ(rp.boundBluePurple, 285.0f);
    EXPECT_FLOAT_EQ(rp.boundPurpleMagenta, 310.0f);
    EXPECT_FLOAT_EQ(rp.grainRoughness, 0.7f);
    EXPECT_FLOAT_EQ(rp.panelY, 0.85f);
    EXPECT_FLOAT_EQ(rp.tapeJitter, 0.2f);
    EXPECT_FLOAT_EQ(rp.scanlines, 0.3f);
    EXPECT_FLOAT_EQ(rp.chromaShiftInvert, 1.0f);
}
