#pragma once
#include <jni.h>
#include <android/hardware_buffer.h>
#include "core/RenderParams.h"

class GrovkornetEngine;

class FrameRenderer {
public:
    static bool renderOffscreenFrame(GrovkornetEngine& gEngine, void* pixelsIn, void* pixelsOut, const RenderParams& params);
    static bool renderHardwareBufferFrame(GrovkornetEngine& gEngine, AHardwareBuffer* ahb, const RenderParams& params);
    static bool renderLiveFrame(GrovkornetEngine& gEngine, const RenderParams& params, const float* uvMatrixIn,
                                int cameraWidth, int cameraHeight, int vpW, int vpH,
                                bool skipScreenRender, bool isNewFrame,
                                int& actualFps, int& stampedFps, bool& fpsUpdated);
};
