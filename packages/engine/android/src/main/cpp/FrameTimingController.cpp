#include "FrameTimingController.h"
#include <chrono>

uint64_t FrameTimingController::getCurrentTimeMs() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now().time_since_epoch()
    ).count();
}

bool FrameTimingController::shouldCaptureFrame(int targetFps) {
    uint64_t now = getCurrentTimeMs();
    if (lastUpdateTime == 0) {
        lastUpdateTime = now;
        fboFramesCount++;
        return true;
    }
    uint64_t dt = now - lastUpdateTime;
    lastUpdateTime = now;

    int target = (targetFps > 0) ? targetFps : 60;
    uint64_t interval = 1000ULL / target;
    timeAccumulator += dt;

    bool shouldCapture = false;
    if (timeAccumulator + 3 >= interval) {
        shouldCapture = true;
        if (timeAccumulator > interval * 3) {
            timeAccumulator = 0;
        } else {
            timeAccumulator -= interval;
        }
    }

    if (shouldCapture) {
        fboFramesCount++;
    }

    return shouldCapture;
}

void FrameTimingController::updateFps(int& outActualFps, int& outStampedFps, bool& outFpsUpdated) {
    uint64_t now = getCurrentTimeMs();
    if (lastLogTime == 0) lastLogTime = now;
    framesCount++;
    outFpsUpdated = false;
    if (now - lastLogTime >= 500) {
        uint64_t elapsed = now - lastLogTime;
        if (elapsed > 0) {
            outActualFps = static_cast<int>((framesCount * 1000ULL) / elapsed);
            outStampedFps = static_cast<int>((fboFramesCount * 1000ULL) / elapsed);
            outFpsUpdated = true;
        }
        lastLogTime = now;
        framesCount = 0;
        fboFramesCount = 0;
    }
}

void FrameTimingController::reset() {
    lastUpdateTime = 0;
    timeAccumulator = 0;
    framesCount = 0;
    fboFramesCount = 0;
    lastLogTime = 0;
}
