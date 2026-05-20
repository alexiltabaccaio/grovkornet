#include "OverlayCompositor.h"
#include <android/log.h>
#include <android/bitmap.h>
#include <algorithm>

#define LOG_TAG "OverlayCompositor"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

OverlayCompositor::OverlayCompositor(int width, int height) : width(width), height(height) {
    overlayBuffer.resize(width * height * 4, 0);
}

OverlayCompositor::~OverlayCompositor() {
    stop();
}

void OverlayCompositor::start(JavaVM* jvm) {
    std::unique_lock<std::mutex> lock(compositingMutex);
    if (!compositingThreadRunning) {
        javaVm = jvm;
        compositingThreadRunning = true;
        compositingThread = std::thread(&OverlayCompositor::compositingLoop, this);
    }
}

void OverlayCompositor::stop() {
    {
        std::unique_lock<std::mutex> lock(compositingMutex);
        if (!compositingThreadRunning) return;
        compositingThreadRunning = false;
        compositingCv.notify_all();
    }
    if (compositingThread.joinable()) {
        compositingThread.join();
    }
}

void OverlayCompositor::triggerOverlayUpdate(std::vector<jobject>&& bitmaps, JNIEnv* env) {
    std::unique_lock<std::mutex> lock(compositingMutex);
    for (jobject bmp : pendingBitmaps) {
        env->DeleteGlobalRef(bmp);
    }
    pendingBitmaps.clear();
    for (jobject bmp : bitmaps) {
        pendingBitmaps.push_back(env->NewGlobalRef(bmp));
    }
    compositingInProgress = true;
    compositingCv.notify_one();
}

void OverlayCompositor::applyOverlayTextureUpdate(filament::Engine& engine, filament::Texture* overlayTexture) {
    std::vector<uint8_t> localOverlay;
    bool updateNeeded = false;
    {
        std::unique_lock<std::mutex> lock(compositingMutex);
        if (compositingDataReady) {
            localOverlay = overlayBuffer;
            compositingDataReady = false;
            updateNeeded = true;
        }
    }
    if (updateNeeded && overlayTexture) {
        auto* bufferCopy = new std::vector<uint8_t>(std::move(localOverlay));
        overlayTexture->setImage(engine, 0, filament::Texture::PixelBufferDescriptor(
            bufferCopy->data(),
            bufferCopy->size(),
            filament::backend::PixelDataFormat::RGBA,
            filament::backend::PixelDataType::UBYTE,
            [](void* buffer, size_t size, void* user) {
                delete static_cast<std::vector<uint8_t>*>(user);
            },
            bufferCopy
        ));
    }
}

void OverlayCompositor::compositingLoop() {
    while (true) {
        std::vector<jobject> localBitmaps;
        {
            std::unique_lock<std::mutex> lock(compositingMutex);
            compositingCv.wait(lock, [this]() { return !compositingThreadRunning || compositingInProgress; });
            if (!compositingThreadRunning) {
                if (javaVm) {
                    JNIEnv* env = nullptr;
                    javaVm->AttachCurrentThread(&env, nullptr);
                    for (jobject bmp : pendingBitmaps) {
                        env->DeleteGlobalRef(bmp);
                    }
                    javaVm->DetachCurrentThread();
                }
                pendingBitmaps.clear();
                break;
            }
            localBitmaps = pendingBitmaps;
            pendingBitmaps.clear();
        }
        if (localBitmaps.empty()) {
            std::unique_lock<std::mutex> lock(compositingMutex);
            compositingInProgress = false;
            continue;
        }
        JNIEnv* env = nullptr;
        if (javaVm && javaVm->AttachCurrentThread(&env, nullptr) == JNI_OK) {
            std::vector<uint8_t> tempOverlay(width * height * 4, 0);
            for (jobject bitmap : localBitmaps) {
                AndroidBitmapInfo info;
                void* pixels = nullptr;
                if (AndroidBitmap_getInfo(env, bitmap, &info) >= 0 && 
                    AndroidBitmap_lockPixels(env, bitmap, &pixels) >= 0) {
                    uint8_t* dst = tempOverlay.data();
                    uint8_t* src = static_cast<uint8_t*>(pixels);
                    int bmpWidth = info.width;
                    int bmpHeight = info.height;
                    int minW = std::min(width, bmpWidth);
                    int minH = std::min(height, bmpHeight);
                    for (int y = 0; y < minH; ++y) {
                        for (int x = 0; x < minW; ++x) {
                            int dstIdx = (y * width + x) * 4;
                            int srcIdx = (y * bmpWidth + x) * 4;
                            float srcA = src[srcIdx + 3] / 255.0f;
                            if (srcA > 0.0f) {
                                float invA = 1.0f - srcA;
                                dst[dstIdx + 0] = static_cast<uint8_t>(src[srcIdx + 0] * srcA + dst[dstIdx + 0] * invA);
                                dst[dstIdx + 1] = static_cast<uint8_t>(src[srcIdx + 1] * srcA + dst[dstIdx + 1] * invA);
                                dst[dstIdx + 2] = static_cast<uint8_t>(src[srcIdx + 2] * srcA + dst[dstIdx + 2] * invA);
                                dst[dstIdx + 3] = static_cast<uint8_t>(src[srcIdx + 3] * srcA + dst[dstIdx + 3] * invA);
                            }
                        }
                    }
                    AndroidBitmap_unlockPixels(env, bitmap);
                }
                env->DeleteGlobalRef(bitmap);
            }
            javaVm->DetachCurrentThread();
            {
                std::unique_lock<std::mutex> lock(compositingMutex);
                overlayBuffer = std::move(tempOverlay);
                compositingDataReady = true;
                compositingInProgress = false;
                overlayEnabled = true;
            }
        } else {
            std::unique_lock<std::mutex> lock(compositingMutex);
            compositingInProgress = false;
        }
    }
}
