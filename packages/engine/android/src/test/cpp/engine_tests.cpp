#include <gtest/gtest.h>
#include "grovkornet-engine.h"

TEST(GrovkornetEngineTest, BasicInitializationAndProperties) {
    GrovkornetEngine engine(640, 480);
    
    // Verify properties are set correctly
    EXPECT_EQ(engine.width, 640);
    EXPECT_EQ(engine.height, 480);
    EXPECT_EQ(engine.engine, nullptr);
    EXPECT_EQ(engine.renderer, nullptr);
    EXPECT_EQ(engine.view, nullptr);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
