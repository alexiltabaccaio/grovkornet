#include <gtest/gtest.h>
#include "core/GrovkornetEngine.h"

TEST(GrovkornetEngineTest, BasicInitializationAndProperties) {
    GrovkornetEngine engine(640, 480);
    
    // Verify properties are set correctly
    EXPECT_EQ(engine.width, 640);
    EXPECT_EQ(engine.height, 480);
    EXPECT_EQ(engine.engine, nullptr);
    EXPECT_EQ(engine.renderer, nullptr);
    EXPECT_EQ(engine.view, nullptr);
}


