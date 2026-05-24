#include "DrsManager.h"
#include <android/log.h>
#include <algorithm>

#define LOG_TAG "DrsManager"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

void DrsManager::recordFrameTimeAndEvaluate(float frameTimeMs) {
    recentFrameTimes.push_back(frameTimeMs);
    if (recentFrameTimes.size() > FRAME_TIME_WINDOW_SIZE) {
        recentFrameTimes.erase(recentFrameTimes.begin());
    }
    
    framesSinceLastDrsScale++;
    if (framesSinceLastDrsScale >= DRS_COOLDOWN_FRAMES && recentFrameTimes.size() == FRAME_TIME_WINDOW_SIZE) {
        float avgFrameTime = 0.0f;
        for (float t : recentFrameTimes) {
            avgFrameTime += t;
        }
        avgFrameTime /= recentFrameTimes.size();
        
        float nextScale = currentDrsScale;
        if (avgFrameTime > 15.0f) {
            nextScale = std::max(MIN_DRS_SCALE, currentDrsScale - 0.1f);
        } else if (avgFrameTime < 11.0f) {
            nextScale = std::min(MAX_DRS_SCALE, currentDrsScale + 0.05f);
        }
        
        if (nextScale != currentDrsScale) {
            currentDrsScale = nextScale;
            framesSinceLastDrsScale = 0;
            LOGI("DRS Scale changed to %.2f (avg frame time: %.2f ms)", currentDrsScale, avgFrameTime);
        }
    }
}

void DrsManager::forceCooldownTrigger() {
    framesSinceLastDrsScale = DRS_COOLDOWN_FRAMES;
}
