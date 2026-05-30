#include <gtest/gtest.h>
#include "utils/DrsManager.h"

TEST(DrsManagerTest, InitialState) {
    DrsManager manager;
    EXPECT_FLOAT_EQ(manager.getScale(), 1.0f);
}

TEST(DrsManagerTest, EvaluateDrsScaleDown) {
    DrsManager manager;
    manager.forceCooldownTrigger();
    
    // Fill the window with high frame times (e.g. 20ms) to trigger a scale down
    for (size_t i = 0; i < DrsManager::FRAME_TIME_WINDOW_SIZE; ++i) {
        manager.recordFrameTimeAndEvaluate(20.0f);
    }
    
    // It should scale down from 1.0 to 0.9
    EXPECT_FLOAT_EQ(manager.getScale(), 0.9f);
}

TEST(DrsManagerTest, EvaluateDrsScaleUp) {
    DrsManager manager;
    manager.setScale(0.8f);
    manager.forceCooldownTrigger();
    
    // Fill the window with low frame times (e.g. 5ms) to trigger a scale up
    for (size_t i = 0; i < DrsManager::FRAME_TIME_WINDOW_SIZE; ++i) {
        manager.recordFrameTimeAndEvaluate(5.0f);
    }
    
    // It should scale up from 0.8 to 0.85
    EXPECT_FLOAT_EQ(manager.getScale(), 0.85f);
}

TEST(DrsManagerTest, WindowSlidingAndErase) {
    DrsManager manager;
    // Record more frames than the window size to trigger sliding window erase
    for (size_t i = 0; i < DrsManager::FRAME_TIME_WINDOW_SIZE + 5; ++i) {
        manager.recordFrameTimeAndEvaluate(16.0f);
    }
}

