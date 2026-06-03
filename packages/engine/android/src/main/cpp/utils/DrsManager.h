#pragma once
#include <vector>
#include <cstddef>
#include "../core/HardwareConfig.h"

class DrsManager {
public:
    static constexpr float MIN_DRS_SCALE = HardwareConfig::MIN_DRS_SCALE;
    static constexpr float MAX_DRS_SCALE = HardwareConfig::MAX_DRS_SCALE;
    static constexpr size_t FRAME_TIME_WINDOW_SIZE = HardwareConfig::FRAME_TIME_WINDOW_SIZE;
    static constexpr int DRS_COOLDOWN_FRAMES = HardwareConfig::DRS_COOLDOWN_FRAMES;

    void recordFrameTimeAndEvaluate(float frameTimeMs);
    void forceCooldownTrigger();
    
    float getScale() const { return currentDrsScale; }
    void setScale(float scale) { currentDrsScale = scale; }

private:
    float currentDrsScale = 1.0f;
    std::vector<float> recentFrameTimes;
    int framesSinceLastDrsScale = 0;
};
