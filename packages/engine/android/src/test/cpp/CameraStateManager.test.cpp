#include <gtest/gtest.h>
#include "state/CameraStateManager.h"
#include <thread>
#include <vector>
#include <atomic>
#include <chrono>

TEST(CameraStateManagerTest, BasicClamping) {
    auto& manager = CameraStateManager::getInstance();

    // Test extreme saturation clamping (bounds: 0.0 to 2.0)
    manager.updateStateField([](RenderState& state) {
        state.renderParams.saturation = 5.0f;
    });
    EXPECT_NEAR(manager.getActiveState()->renderParams.saturation, 2.0f, 0.0001f);

    manager.updateStateField([](RenderState& state) {
        state.renderParams.saturation = -1.0f;
    });
    EXPECT_NEAR(manager.getActiveState()->renderParams.saturation, 0.0f, 0.0001f);

    // Test extreme contrast clamping (bounds: 0.0 to 2.0)
    manager.updateStateField([](RenderState& state) {
        state.renderParams.contrast = 3.0f;
    });
    EXPECT_NEAR(manager.getActiveState()->renderParams.contrast, 2.0f, 0.0001f);

    manager.updateStateField([](RenderState& state) {
        state.renderParams.contrast = -0.5f;
    });
    EXPECT_NEAR(manager.getActiveState()->renderParams.contrast, 0.0f, 0.0001f);
}

TEST(CameraStateManagerTest, ConcurrencyStressTest) {
    auto& manager = CameraStateManager::getInstance();
    std::atomic<bool> running{true};
    const int numWriters = 4;
    const int numReaders = 4;
    const int durationMs = 500; // stress test for 500ms

    std::vector<std::thread> threads;

    // Launch writer threads
    for (int i = 0; i < numWriters; ++i) {
        threads.emplace_back([&manager, &running, i]() {
            float val = 0.0f;
            while (running) {
                val += 0.01f;
                if (val > 2.0f) val = 0.0f;
                
                manager.updateStateField([val, i](RenderState& state) {
                    state.renderParams.saturation = val;
                    state.renderParams.contrast = val;
                    state.ev = static_cast<float>(i);
                });
                std::this_thread::yield();
            }
        });
    }

    // Launch reader threads
    for (int i = 0; i < numReaders; ++i) {
        threads.emplace_back([&manager, &running]() {
            while (running) {
                auto state = manager.getActiveState();
                // Read params and assert they are in valid clamped ranges
                float sat = state->renderParams.saturation;
                float con = state->renderParams.contrast;
                float evVal = state->ev;
                
                EXPECT_GE(sat, -0.0001f);
                EXPECT_LE(sat, 2.0001f);
                EXPECT_GE(con, -0.0001f);
                EXPECT_LE(con, 2.0001f);
                EXPECT_GE(evVal, 0.0f);
                EXPECT_LE(evVal, 4.0f);
                
                std::this_thread::yield();
            }
        });
    }

    // Let them run for the specified duration
    std::this_thread::sleep_for(std::chrono::milliseconds(durationMs));
    running = false;

    // Join all threads
    for (auto& t : threads) {
        if (t.joinable()) {
            t.join();
        }
    }
}
