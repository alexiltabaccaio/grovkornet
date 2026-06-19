#include <gtest/gtest.h>
#include <thread>
#include <vector>
#include <atomic>
#include <chrono>
#include <mutex>
#include "core/GrovkornetEngine.h"
#include <filament/Engine.h>

class JniLifecycleConcurrencyTest : public ::testing::Test {
protected:
    GrovkornetEngine* gEngine;

    void SetUp() override {
        gEngine = new GrovkornetEngine(640, 480);
        // We only instantiate the wrapper here, without full filament initialization
        // to test the mutex locks on lifecycle methods like triggerOverlayUpdate 
        // without needing a full JVM or GL context.
    }

    void TearDown() override {
        delete gEngine;
    }
};

TEST_F(JniLifecycleConcurrencyTest, ConcurrentJniCalls) {
    std::atomic<bool> running{true};
    const int numThreads = 6;
    const int durationMs = 500;

    std::vector<std::thread> threads;

    // Simulate different JNI endpoints calling engine methods concurrently
    for (int i = 0; i < numThreads; ++i) {
        threads.emplace_back([this, &running, i]() {
            while (running) {
                if (i % 3 == 0) {
                    // Simulate LiveFilmProcessor nativeSimulateFrameTime
                    gEngine->simulateFrameTime(16.6f);
                } else if (i % 3 == 1) {
                    // Simulate nativeGetDrsScale
                    float drs = gEngine->getDrsScale();
                    EXPECT_GE(drs, 0.0f);
                } else {
                    // Simulate nativeUpdateOverlay passing empty list
                    // Use nullptr for JNIEnv since we're just checking lock safety in C++
                    std::vector<jobject> dummyList;
                    gEngine->triggerOverlayUpdate(std::move(dummyList), nullptr);
                }
                
                std::this_thread::yield();
            }
        });
    }

    std::this_thread::sleep_for(std::chrono::milliseconds(durationMs));
    running = false;

    for (auto& t : threads) {
        if (t.joinable()) t.join();
    }

    SUCCEED() << "Concurrent JNI bridge calls completed without crashing or deadlocking.";
}

// Global engine lifecycle mutex testing as simulated in JNI
static std::mutex g_engineLifecycleMutex;

TEST_F(JniLifecycleConcurrencyTest, ConcurrentEngineInstantiationAndRelease) {
    std::atomic<bool> running{true};
    const int durationMs = 500;

    std::vector<std::thread> threads;
    GrovkornetEngine* sharedEnginePtr = nullptr;

    // Thread 1: Constantly instantiating and releasing (simulating fast unmounts/remounts from React Native)
    threads.emplace_back([&running, &sharedEnginePtr]() {
        while (running) {
            std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
            if (sharedEnginePtr == nullptr) {
                sharedEnginePtr = new GrovkornetEngine(1920, 1080);
            } else {
                delete sharedEnginePtr;
                sharedEnginePtr = nullptr;
            }
            std::this_thread::yield();
        }
        
        // Cleanup at end
        std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
        if (sharedEnginePtr) {
            delete sharedEnginePtr;
            sharedEnginePtr = nullptr;
        }
    });

    // Thread 2: Simulating JNI calls trying to access the pointer
    threads.emplace_back([&running, &sharedEnginePtr]() {
        while (running) {
            std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
            if (sharedEnginePtr) {
                // If it's valid under lock, it's safe to use
                float drs = sharedEnginePtr->getDrsScale();
                EXPECT_GE(drs, 0.0f);
            }
            std::this_thread::yield();
        }
    });

    std::this_thread::sleep_for(std::chrono::milliseconds(durationMs));
    running = false;

    for (auto& t : threads) {
        if (t.joinable()) t.join();
    }

    SUCCEED() << "Concurrent Engine instantiation/release completed without crashing.";
}
