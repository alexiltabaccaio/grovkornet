#include <gtest/gtest.h>
#include "utils/FrameTimingController.h"

TEST(FrameTimingControllerTest, PacingAndReset) {
    FrameTimingController controller;
    
    // First frame should capture
    EXPECT_TRUE(controller.shouldCaptureFrame(30));
    
    // If we call instantly, it shouldn't capture (since 0ms passed)
    EXPECT_FALSE(controller.shouldCaptureFrame(30));

    controller.reset();
    EXPECT_TRUE(controller.shouldCaptureFrame(30));
}
