#include <gtest/gtest.h>
#include "utils/WatermarkEngine.h"
#include <vector>

TEST(WatermarkEngineTest, EmbedAndVerifySignature) {
    // 200x200 dummy RGBA buffer
    std::vector<uint32_t> pixels(200 * 200, 0xFF808080); // mid-gray with full alpha

    // Before embedding, it should not verify
    EXPECT_FALSE(WatermarkEngine::verifySignature(pixels.data(), 200, 200, 200));

    // Embed signature (writes to 5 regions)
    WatermarkEngine::embedSignature(pixels.data(), 200, 200, 200);

    // After embedding, it should verify successfully
    EXPECT_TRUE(WatermarkEngine::verifySignature(pixels.data(), 200, 200, 200));

    // Tamper with the top-left region (0,0 to 64,64)
    for (int y = 0; y < 64; ++y) {
        for (int x = 0; x < 64; ++x) {
            pixels[y * 200 + x] = 0xFF000000;
        }
    }

    // It should STILL verify successfully because other regions (corners & center) are intact!
    EXPECT_TRUE(WatermarkEngine::verifySignature(pixels.data(), 200, 200, 200));

    // Tamper with the entire image
    for (size_t i = 0; i < pixels.size(); ++i) {
        pixels[i] = 0xFF000000;
    }

    // After full tampering, verification should fail
    EXPECT_FALSE(WatermarkEngine::verifySignature(pixels.data(), 200, 200, 200));
}

TEST(WatermarkEngineTest, ImageTooSmall) {
    std::vector<uint32_t> pixels(50 * 50, 0xFF808080);
    // Should return early and not modify/crash
    WatermarkEngine::embedSignature(pixels.data(), 50, 50, 50);
    // Verification should return false early
    EXPECT_FALSE(WatermarkEngine::verifySignature(pixels.data(), 50, 50, 50));
}

