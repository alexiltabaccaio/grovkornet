#include <gtest/gtest.h>
#include "pipeline/ShaderManager.h"
#include <filament/Engine.h>

TEST(ShaderManagerTest, NullAssetManagerInitialization) {
    ShaderManager manager;

    // Verify all instances are initially null
    EXPECT_EQ(manager.getMaterialInstance2D(), nullptr);
    EXPECT_EQ(manager.getMaterialInstanceExternal(), nullptr);
    EXPECT_EQ(manager.getMaterialInstanceDownsample(), nullptr);
    EXPECT_EQ(manager.getMaterialInstanceBlurDown(), nullptr);
    EXPECT_EQ(manager.getMaterialInstanceBlurUp(), nullptr);
    EXPECT_EQ(manager.getMaterialInstanceComposite(), nullptr);

    // Create a NOOP engine
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    // Call init with nullptr assetManager. It should return false.
    bool result = manager.init(*engine, nullptr);
    EXPECT_FALSE(result);

    // Instances should still be null
    EXPECT_EQ(manager.getMaterialInstance2D(), nullptr);

    // Verify destroy does not crash
    manager.destroy(*engine);

    // Clean up
    filament::Engine::destroy(&engine);
}
