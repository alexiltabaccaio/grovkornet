#include <gtest/gtest.h>
#include "state/HybridNitroCameraConfiguration.hpp"
#include "state/CameraStateManager.h"

using namespace margelo::nitro::grovkornet;

TEST(HybridNitroCameraConfigurationTest, BasicGettersSetters) {
    HybridNitroCameraConfiguration config;

    // Test Saturation
    config.setSaturation(1.5);
    EXPECT_NEAR(config.getSaturation(), 1.5, 0.0001);
    EXPECT_NEAR(CameraStateManager::getInstance().getActiveState()->renderParams.saturation, 1.5f, 0.0001f);

    // Test Saturation Clamping (bounds: 0.0 to 2.0)
    config.setSaturation(5.0);
    EXPECT_NEAR(config.getSaturation(), 2.0, 0.0001);

    // Test GrainEnabled (bool mapping)
    config.setGrainEnabled(true);
    EXPECT_TRUE(config.getGrainEnabled());
    EXPECT_NEAR(CameraStateManager::getInstance().getActiveState()->renderParams.grainEnabled, 1.0f, 0.0001f);

    config.setGrainEnabled(false);
    EXPECT_FALSE(config.getGrainEnabled());
    EXPECT_NEAR(CameraStateManager::getInstance().getActiveState()->renderParams.grainEnabled, 0.0f, 0.0001f);
}
