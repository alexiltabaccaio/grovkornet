#pragma once
#include <filament/Engine.h>
#include <filament/Texture.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>

class LutGenerator {
public:
    static constexpr int LUT_SIZE = 33;

    LutGenerator();
    ~LutGenerator();

    void start();
    void stop();

    void triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint);
    void applyLutTextureUpdate(filament::Engine& engine, filament::Texture* lutTexture);

    // Active cache getters (for keeping track of parameters currently bound on GPU)
    float getActiveSaturation() const { return activeSaturation; }
    bool isFirstLutBaked() const { return activeSaturation >= 0.0f; }

private:
    void lutGenerationLoop();

    std::thread lutThread;
    std::mutex lutMutex;
    std::condition_variable lutCv;
    bool lutThreadRunning = false;
    bool lutParametersDirty = false;
    bool lutDataReady = false;

    // Sliders
    float currentSaturation = 1.0f;
    float currentContrast = 1.0f;
    float currentEv = 0.0f;
    float currentWhiteBalance = 5000.0f;
    float currentTint = 0.0f;

    // Cache of active parameters mapped into GPU texture
    float activeSaturation = -1.0f;
    float activeContrast = -1.0f;
    float activeEv = -1.0f;
    float activeWhiteBalance = -1.0f;
    float activeTint = -1.0f;

    std::vector<uint8_t> lutBuffer;
};
