#include <gtest/gtest.h>
#include "core/GrovkornetEngine.h"
#include "core/FrameRenderer.h"

TEST(FrameRendererTest, RenderFunctions_CheckValidation) {
    GrovkornetEngine engine(640, 480);
    RenderParams params;
    params.targetFps = 30.0f;
    params.aspectRatio = 1.0f;

    // Test that passing null parameters yields false
    bool resOffscreen = FrameRenderer::renderOffscreenFrame(engine, nullptr, nullptr, params);
    EXPECT_FALSE(resOffscreen);

    bool resHb = FrameRenderer::renderHardwareBufferFrame(engine, nullptr, params);
    EXPECT_FALSE(resHb);

    int actualFps = 0, stampedFps = 0;
    bool fpsUpdated = false;
    float mockUv[16] = {0};
    // Should fail because liveSwapChain is nullptr
    bool resLive = FrameRenderer::renderLiveFrame(engine, params, mockUv, 640, 480, 640, 480, false, false, actualFps, stampedFps, fpsUpdated);
    EXPECT_FALSE(resLive);
}
