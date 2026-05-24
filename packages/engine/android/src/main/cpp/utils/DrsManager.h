#pragma once
#include <vector>
#include <cstddef>

class DrsManager {
public:
    static constexpr float MIN_DRS_SCALE = 0.5f;
    static constexpr float MAX_DRS_SCALE = 1.0f;
    static constexpr size_t FRAME_TIME_WINDOW_SIZE = 10;
    static constexpr int DRS_COOLDOWN_FRAMES = 30;

    void recordFrameTimeAndEvaluate(float frameTimeMs);
    void forceCooldownTrigger();
    
    float getScale() const { return currentDrsScale; }
    void setScale(float scale) { currentDrsScale = scale; }

private:
    float currentDrsScale = 1.0f;
    std::vector<float> recentFrameTimes;
    int framesSinceLastDrsScale = 0;
};
