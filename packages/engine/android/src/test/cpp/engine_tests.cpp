#include <gtest/gtest.h>
#include "grovkornet-engine.h"
#include "WatermarkEngine.h"
#include "MatrixTransformCalculator.h"
#include "FrameTimingController.h"
#include <vector>

TEST(GrovkornetEngineTest, BasicInitializationAndProperties) {
    GrovkornetEngine engine(640, 480);
    
    // Verify properties are set correctly
    EXPECT_EQ(engine.width, 640);
    EXPECT_EQ(engine.height, 480);
    EXPECT_EQ(engine.engine, nullptr);
    EXPECT_EQ(engine.renderer, nullptr);
    EXPECT_EQ(engine.view, nullptr);
}

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
        // In verifySignature, it does cosTable[x][u] * cosTable[y][v]
        // Let's compute:
        for (int y = 0; y < 8; ++y) {
            for (int x = 0; x < 8; ++x) {
                // Wait! Let's check how the tables are computed/indexed
                // cosTable has dimensions [8][8].
                // In initTables: cosTable[x][u] = ...
                // Let's double check if sum1/sum2 use cosTable[x][u1] and cosTable[y][v1]
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

    // Tamper with the pixels (e.g. clear top left region)
    for (int i = 0; i < 30; ++i) {
        pixels[i] = 0xFF000000;
    }

    // After tampering, verification should fail
    EXPECT_FALSE(WatermarkEngine::verifySignature(pixels.data(), 64, 64, 64));
}

TEST(MatrixTransformCalculatorTest, BasicMatrixOperations) {
    float identity[16];
    MatrixTransformCalculator::setIdentityM(identity);
    EXPECT_FLOAT_EQ(identity[0], 1.0f);
    EXPECT_FLOAT_EQ(identity[5], 1.0f);
    EXPECT_FLOAT_EQ(identity[10], 1.0f);
    EXPECT_FLOAT_EQ(identity[15], 1.0f);
    EXPECT_FLOAT_EQ(identity[1], 0.0f);

    float scale[16];
    MatrixTransformCalculator::setIdentityM(scale);
    MatrixTransformCalculator::scaleM(scale, 2.0f, 3.0f, 1.0f);
    EXPECT_FLOAT_EQ(scale[0], 2.0f);
    EXPECT_FLOAT_EQ(scale[5], 3.0f);
    EXPECT_FLOAT_EQ(scale[10], 1.0f);
    EXPECT_FLOAT_EQ(scale[15], 1.0f);

    float translate[16];
    MatrixTransformCalculator::setIdentityM(translate);
    MatrixTransformCalculator::translateM(translate, 0.5f, -0.5f, 0.0f);
    EXPECT_FLOAT_EQ(translate[12], 0.5f);
    EXPECT_FLOAT_EQ(translate[13], -0.5f);
    EXPECT_FLOAT_EQ(translate[14], 0.0f);
    EXPECT_FLOAT_EQ(translate[15], 1.0f);
}

TEST(FrameTimingControllerTest, PacingAndReset) {
    FrameTimingController controller;
    
    // First frame should capture
    EXPECT_TRUE(controller.shouldCaptureFrame(30));
    
    // If we call instantly, it shouldn't capture (since 0ms passed)
    EXPECT_FALSE(controller.shouldCaptureFrame(30));

    controller.reset();
    EXPECT_TRUE(controller.shouldCaptureFrame(30));
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
