#include <gtest/gtest.h>
#include "GrovkornetEngine.h"

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
    float mockParams[27] = {
        1.2f,  // saturation
        0.9f,  // contrast
        0.5f,  // grainIntensity
        0.3f,  // grainChroma
        1.1f,  // grainSize
        2.0f,  // grainSpeed
        0.15f, // vignetteIntensity
        0.7f,  // vhsIntensity
        123.45f, // time
        -0.5f, // ev
        5500.0f, // whiteBalance
        5.0f,    // tint
        0.4f,  // bloomIntensity
        0.1f,  // chromaticAberration
        90.0f,   // aberrationDirection
        0.8f,  // sharpening
        45.0f,   // satRed
        46.0f,   // satOrange
        47.0f,   // satYellow
        48.0f,   // satGreen
        49.0f,   // satCyan
        51.0f,   // satBlue
        52.0f,   // satPurple
        53.0f,   // satMagenta
        30.0f,   // targetFps
        2.0f,    // aspectRatio
        1080.0f  // targetResolution
    };

    RenderParams rp = parseRenderParams(mockParams);

    EXPECT_FLOAT_EQ(rp.saturation, 1.2f);
    EXPECT_FLOAT_EQ(rp.contrast, 0.9f);
    EXPECT_FLOAT_EQ(rp.grainIntensity, 0.5f);
    EXPECT_FLOAT_EQ(rp.grainChroma, 0.3f);
    EXPECT_FLOAT_EQ(rp.grainSize, 1.1f);
    EXPECT_FLOAT_EQ(rp.grainSpeed, 2.0f);
    EXPECT_FLOAT_EQ(rp.vignetteIntensity, 0.15f);
    EXPECT_FLOAT_EQ(rp.vhsIntensity, 0.7f);
    EXPECT_FLOAT_EQ(rp.time, 123.45f);
    EXPECT_FLOAT_EQ(rp.ev, -0.5f);
    EXPECT_FLOAT_EQ(rp.whiteBalance, 5500.0f);
    EXPECT_FLOAT_EQ(rp.tint, 5.0f);
    EXPECT_FLOAT_EQ(rp.bloomIntensity, 0.4f);
    EXPECT_FLOAT_EQ(rp.chromaticAberration, 0.1f);
    EXPECT_FLOAT_EQ(rp.aberrationDirection, 90.0f);
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
}


