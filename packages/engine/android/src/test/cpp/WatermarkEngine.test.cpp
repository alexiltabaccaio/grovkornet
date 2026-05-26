#include <gtest/gtest.h>
#include "utils/WatermarkEngine.h"
#include <vector>

TEST(WatermarkEngineTest, EmbedAndVerifySignature) {
    // 64x64 dummy RGBA buffer
    std::vector<uint32_t> pixels(64 * 64, 0xFF808080); // mid-gray with full alpha

    // Print debug details of verifySignature for the un-watermarked buffer
    printf("DEBUG: Starting verification of un-watermarked buffer:\n");


    bool isVerified = WatermarkEngine::verifySignature(pixels.data(), 64, 64, 64);
    printf("DEBUG: verifySignature returned %s\n", isVerified ? "true" : "false");

    // Before embedding, it should not verify
    EXPECT_FALSE(isVerified);

    // Embed signature
    WatermarkEngine::embedSignature(pixels.data(), 64, 64, 64);

    // After embedding, it should verify successfully
    EXPECT_TRUE(WatermarkEngine::verifySignature(pixels.data(), 64, 64, 64));

    // Tamper with the pixels (e.g. clear top half)
    for (int i = 0; i < 2000; ++i) {
        pixels[i] = 0xFF000000;
    }

    // After tampering, verification should fail
    EXPECT_FALSE(WatermarkEngine::verifySignature(pixels.data(), 64, 64, 64));
}
