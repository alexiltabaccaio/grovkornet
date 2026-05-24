#include <gtest/gtest.h>
#include "utils/WatermarkEngine.h"
#include <vector>

TEST(WatermarkEngineTest, EmbedAndVerifySignature) {
    // 64x64 dummy RGBA buffer
    std::vector<uint32_t> pixels(64 * 64, 0xFF808080); // mid-gray with full alpha

    // Print debug details of verifySignature for the un-watermarked buffer
    printf("DEBUG: Starting verification of un-watermarked buffer:\n");
    WatermarkEngine::initTables();
    int matchingBits = 0;
    for (int blockIndex = 0; blockIndex < 64; ++blockIndex) {
        int startX = (blockIndex % 8) * 8;
        int startY = (blockIndex / 8) * 8;
        uint64_t expectedBit = (WatermarkEngine::SIGNATURE >> (63 - blockIndex)) & 1ULL;
        double luma[8][8];
        for (int y = 0; y < 8; ++y) {
            for (int x = 0; x < 8; ++x) {
                uint32_t color = pixels[(startY + y) * 64 + (startX + x)];
                int r = (color >> 16) & 0xFF;
                int g = (color >> 8) & 0xFF;
                int b = color & 0xFF;
                luma[y][x] = 0.299 * r + 0.587 * g + 0.114 * b;
            }
        }
        int u1 = 3; int v1 = 4;
        int u2 = 4; int v2 = 3;
        double sum1 = 0.0; double sum2 = 0.0;
        for (int y = 0; y < 8; ++y) {
            for (int x = 0; x < 8; ++x) {
            }
        }
    }

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
