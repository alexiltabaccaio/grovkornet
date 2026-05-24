#pragma once
#include <jni.h>
#include <filament/Engine.h>
#include <filament/Texture.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>

class OverlayCompositor {
public:
    OverlayCompositor(int width, int height);
    ~OverlayCompositor();

    void start(JavaVM* jvm);
    void stop();

    void triggerOverlayUpdate(std::vector<jobject>&& bitmaps, JNIEnv* env);
    void applyOverlayTextureUpdate(filament::Engine& engine, filament::Texture* overlayTexture);

    bool isOverlayEnabled() const { return overlayEnabled; }

private:
    void compositingLoop();

    int width = 0;
    int height = 0;

    std::thread compositingThread;
    std::mutex compositingMutex;
    std::condition_variable compositingCv;
    bool compositingThreadRunning = false;
    bool compositingInProgress = false;
    bool compositingDataReady = false;

    std::vector<uint8_t> overlayBuffer;
    std::vector<jobject> pendingBitmaps;
    JavaVM* javaVm = nullptr;
    bool overlayEnabled = false;
};
