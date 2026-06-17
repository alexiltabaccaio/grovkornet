#pragma once
#include <jni.h>
#include <android/hardware_buffer.h>
#include "state/CameraStateManager.h"

class GrovkornetEngine;

class FrameRenderer {
public:
    static bool renderOffscreenFrame(GrovkornetEngine& gEngine, void* pixelsIn, void* pixelsOut, const RenderState* state);
    static bool renderHardwareBufferFrame(GrovkornetEngine& gEngine, AHardwareBuffer* ahb, const RenderState* state);
    static bool renderLiveFrame(GrovkornetEngine& gEngine, const RenderState* state, const float* uvMatrixIn,
                                int cameraWidth, int cameraHeight, int vpW, int vpH,
                                bool skipScreenRender, bool isNewFrame,
                                int& actualFps, int& stampedFps, bool& fpsUpdated);
};
