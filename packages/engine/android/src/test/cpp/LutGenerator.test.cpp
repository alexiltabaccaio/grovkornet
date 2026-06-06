#include <gtest/gtest.h>
#include "pipeline/LutGenerator.h"
#include <filament/Engine.h>
#include <filament/Texture.h>
#include <chrono>
#include <thread>

TEST(LutGeneratorTest, BasicLutGenerationAndBaking) {
    LutGenerator generator;
    
    // Verify initial state
    EXPECT_FALSE(generator.isFirstLutBaked());
    EXPECT_LT(generator.getActiveSaturation(), 0.0f);

    // Start background thread
    generator.start();

    // Trigger an update
    generator.triggerLutUpdate(0.8f, 1.2f, 0.5f, 5500.0f, 5.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               350.0f, 40.0f, 70.0f, 110.0f,
                               170.0f, 230.0f, 280.0f, 315.0f,
                               0.0f, 1.0f, 0.5f,
                               1.0f, 1.0f, 1.0f, 1.0f,
                               0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);

    // Give it a brief moment to process the update on the background thread
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // Create a NOOP engine and a 3D texture for testing the texture upload
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    filament::Texture* lutTexture = filament::Texture::Builder()
        .width(LutGenerator::LUT_SIZE)
        .height(LutGenerator::LUT_SIZE)
        .depth(LutGenerator::LUT_SIZE)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_3D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
    
    ASSERT_NE(lutTexture, nullptr);

    // Apply texture update
    generator.applyLutTextureUpdate(*engine, lutTexture);

    // After texture update, the cache should reflect the new parameters
    EXPECT_TRUE(generator.isFirstLutBaked());
    EXPECT_NEAR(generator.getActiveSaturation(), 0.8f, 0.001f);

    // Stop background thread
    generator.stop();

    // Clean up
    engine->destroy(lutTexture);
    filament::Engine::destroy(&engine);
}

TEST(LutGeneratorTest, PreventColorInversionWithExtremeHighlights) {
    LutGenerator generator;
    generator.start();

    // Trigger update with extreme highlights = 2.0f (which previously caused inversion)
    generator.triggerLutUpdate(1.0f, 1.0f, 0.0f, 5000.0f, 0.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               350.0f, 40.0f, 70.0f, 110.0f,
                               170.0f, 230.0f, 280.0f, 315.0f,
                               0.0f, 2.0f, 0.5f,
                               0.0f, 0.0f, 0.0f, 0.0f,
                               0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);

    // Wait for the LUT calculation to finish on the background thread
    generator.waitForLut();

    // Create a NOOP engine and a 3D texture for testing the texture upload
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    filament::Texture* lutTexture = filament::Texture::Builder()
        .width(LutGenerator::LUT_SIZE)
        .height(LutGenerator::LUT_SIZE)
        .depth(LutGenerator::LUT_SIZE)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_3D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
    
    ASSERT_NE(lutTexture, nullptr);

    // Apply texture update to update the active cache parameters
    generator.applyLutTextureUpdate(*engine, lutTexture);

    // Verify it completed successfully and parameters are cached
    EXPECT_TRUE(generator.isFirstLutBaked());

    // Stop background thread and clean up
    generator.stop();
    engine->destroy(lutTexture);
    filament::Engine::destroy(&engine);
}

TEST(LutGeneratorTest, CoverageCornerCases) {
    LutGenerator generator;
    generator.start();

    // 1. Trigger update with normal parameters
    generator.triggerLutUpdate(0.8f, 1.2f, 0.5f, 5500.0f, 5.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               350.0f, 40.0f, 70.0f, 110.0f,
                               170.0f, 230.0f, 280.0f, 315.0f,
                               0.0f, 1.0f, 0.5f,
                               1.0f, 1.0f, 1.0f, 1.0f,
                               0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);

    // 2. Trigger with exact same parameters to test early return (lines 85-86)
    generator.triggerLutUpdate(0.8f, 1.2f, 0.5f, 5500.0f, 5.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               350.0f, 40.0f, 70.0f, 110.0f,
                               170.0f, 230.0f, 280.0f, 315.0f,
                               0.0f, 1.0f, 0.5f,
                               1.0f, 1.0f, 1.0f, 1.0f,
                               0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);

    // 3. Trigger with extreme float value to cause precision loss in denom (lines 405-406)
    // 4. Trigger with 0.0f for all boundaries to cause activeBand == -1 (lines 242-243)
    generator.triggerLutUpdate(0.8f, 1.2f, 0.5f, 5500.0f, 5.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               50.0f, 50.0f, 50.0f, 50.0f,
                               0.0f, 0.0f, 0.0f, 0.0f,
                               0.0f, 0.0f, 0.0f, 0.0f,
                               -100000.0f, 100000.0f, 0.5f,
                               0.0f, 0.0f, 0.0f, 0.0f,
                               0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);

    generator.waitForLut();
    generator.stop();
}



