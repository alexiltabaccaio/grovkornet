#include <gtest/gtest.h>
#include "OverlayCompositor.h"
#include <filament/Engine.h>
#include <filament/Texture.h>

TEST(OverlayCompositorTest, BasicThreadLifecycleAndTextureUpdate) {
    OverlayCompositor compositor(128, 128);

    EXPECT_FALSE(compositor.isOverlayEnabled());

    // Start background thread (with null JVM, which is fine for lifecycle testing)
    compositor.start(nullptr);
    compositor.stop();

    // Create a NOOP engine and a 2D texture
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    filament::Texture* overlayTexture = filament::Texture::Builder()
        .width(128)
        .height(128)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
    ASSERT_NE(overlayTexture, nullptr);

    // Apply texture update (with compositingDataReady false, this will do nothing but should not crash)
    compositor.applyOverlayTextureUpdate(*engine, overlayTexture);

    // Clean up
    engine->destroy(overlayTexture);
    filament::Engine::destroy(&engine);
}
