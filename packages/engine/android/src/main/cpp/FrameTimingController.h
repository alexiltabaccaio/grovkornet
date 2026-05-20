#ifndef FRAME_TIMING_CONTROLLER_H
#define FRAME_TIMING_CONTROLLER_H

#include <cstdint>

class FrameTimingController {
public:
    FrameTimingController() = default;

    bool shouldCaptureFrame(int targetFps);
    void updateFps(int& outActualFps, int& outStampedFps, bool& outFpsUpdated);
    void reset();

private:
    uint64_t lastUpdateTime = 0;
    uint64_t timeAccumulator = 0;
    int framesCount = 0;
    int fboFramesCount = 0;
    uint64_t lastLogTime = 0;

    static uint64_t getCurrentTimeMs();
};

#endif // FRAME_TIMING_CONTROLLER_H
