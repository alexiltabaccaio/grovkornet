#include <jni.h>
#include <android/log.h>
#include <android/bitmap.h>
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <android/native_window_jni.h>
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <vector>
#include <mutex>

static std::mutex g_engineLifecycleMutex;

#include <filament/Engine.h>
#include <filament/Renderer.h>
#include <filament/Texture.h>
#include <filament/TextureSampler.h>
#include <filament/RenderableManager.h>

#include "core/GrovkornetEngine.h"
#include "utils/WatermarkEngine.h"

#define LOG_TAG "GrovkornetJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace filament {
class VirtualMachineEnv {
public:
    static jint JNI_OnLoad(JavaVM* vm) noexcept;
};
}

extern "C" {

RenderParams parseRenderParams(JNIEnv* env, jfloatArray float_params) {
    jfloat* params = env->GetFloatArrayElements(float_params, nullptr);
    RenderParams rp = parseRenderParams(params);
    env->ReleaseFloatArrayElements(float_params, params, JNI_ABORT);
    return rp;
}


JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("Grovkornet Engine JNI Library Loaded Successfully");
    
    // Initialize Filament's JNI VirtualMachineEnv
    filament::VirtualMachineEnv::JNI_OnLoad(vm);
    
    return JNI_VERSION_1_6;
}

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jint width, jint height, jobject assetManagerObj) {
    std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
    GrovkornetEngine* engine = new GrovkornetEngine(width, height);
    env->GetJavaVM(&(engine->javaVm));
    
    AAssetManager* assetManager = AAssetManager_fromJava(env, assetManagerObj);
    
    if (!engine->init(assetManager)) {
        delete engine;
        return 0;
    }
    return reinterpret_cast<jlong>(engine);
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeProcessBitmap(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject bitmap_in, jobject bitmap_out,
        jfloatArray float_params) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) {
        LOGE("Invalid native engine pointer in nativeProcessBitmap");
        return;
    }
    
    struct BitmapLocker {
        JNIEnv* env;
        jobject bitmap;
        void* pixels = nullptr;
        bool locked = false;
        
        BitmapLocker(JNIEnv* e, jobject b) : env(e), bitmap(b) {
            AndroidBitmapInfo info;
            if (AndroidBitmap_getInfo(env, bitmap, &info) >= 0 && 
                AndroidBitmap_lockPixels(env, bitmap, &pixels) >= 0) {
                locked = true;
            }
        }
        ~BitmapLocker() {
            if (locked) AndroidBitmap_unlockPixels(env, bitmap);
        }
    };
    
    try {
        // 1. Lock bitmap pixels
        BitmapLocker inLocker(env, bitmap_in);
        if (!inLocker.locked) {
            LOGE("Failed to lock input bitmap pixels");
            return;
        }
        
        BitmapLocker outLocker(env, bitmap_out);
        if (!outLocker.locked) {
            LOGE("Failed to lock output bitmap pixels");
            return;
        }

        RenderParams parsedParams = parseRenderParams(env, float_params);

        // Call the engine's offscreen rendering method
        enginePtr->renderOffscreenFrame(inLocker.pixels, outLocker.pixels, parsedParams);
        
    } catch (const std::exception& e) {
        LOGE("Filament Exception in nativeProcessBitmap: %s", e.what());
    } catch (...) {
        LOGE("Unknown Exception in nativeProcessBitmap");
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeProcessHardwareBuffer(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject hardwareBuffer, jfloatArray float_params) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr || !hardwareBuffer || !float_params) {
        return;
    }
    
    RenderParams parsedParams = parseRenderParams(env, float_params);
    
    try {
        AHardwareBuffer* ahb = AHardwareBuffer_fromHardwareBuffer(env, hardwareBuffer);
        if (!ahb) {
            LOGE("Failed to get AHardwareBuffer from Java HardwareBuffer");
            return;
        }

        enginePtr->renderHardwareBufferFrame(ahb, parsedParams);

    } catch (const std::exception& e) {
        LOGE("Filament Exception in nativeProcessHardwareBuffer: %s", e.what());
    } catch (...) {
        LOGE("Unknown Exception in nativeProcessHardwareBuffer");
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeUpdateOverlay(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobjectArray bitmaps) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) {
        LOGE("Invalid native engine pointer in nativeUpdateOverlay");
        return;
    }
    std::vector<jobject> bitmapList;
    if (bitmaps) {
        jsize len = env->GetArrayLength(bitmaps);
        for (jsize i = 0; i < len; ++i) {
            jobject bmp = env->GetObjectArrayElement(bitmaps, i);
            if (bmp) {
                bitmapList.push_back(bmp);
            }
        }
    }
    enginePtr->triggerOverlayUpdate(std::move(bitmapList), env);
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeRelease(
        JNIEnv* env, jobject thiz, jlong engine_ptr) {
    std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        delete enginePtr;
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeGetDrsScale(
        JNIEnv* env, jobject thiz, jlong engine_ptr) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    return enginePtr ? enginePtr->getDrsScale() : 1.0f;
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeSimulateFrameTime(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jfloat frame_time_ms) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        enginePtr->simulateFrameTime(frame_time_ms);
    }
}

#include <android/asset_manager.h>

// ==========================================
// LiveFilmProcessor JNI Bindings
// ==========================================

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jint width, jint height, jobject assetManagerObj) {
    std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
    GrovkornetEngine* engine = new GrovkornetEngine(width, height);
    env->GetJavaVM(&(engine->javaVm));
    
    AAssetManager* assetManager = AAssetManager_fromJava(env, assetManagerObj);
    
    if (!engine->init(assetManager)) {
        delete engine;
        return 0;
    }
    return reinterpret_cast<jlong>(engine);
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeRelease(
        JNIEnv* env, jobject thiz, jlong engine_ptr) {
    std::lock_guard<std::mutex> lock(g_engineLifecycleMutex);
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        delete enginePtr;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeUpdateOverlay(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobjectArray bitmaps) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) return;
    
    std::vector<jobject> bitmapList;
    if (bitmaps) {
        jsize len = env->GetArrayLength(bitmaps);
        for (jsize i = 0; i < len; ++i) {
            jobject bmp = env->GetObjectArrayElement(bitmaps, i);
            if (bmp) {
                bitmapList.push_back(bmp);
            }
        }
    }
    enginePtr->triggerOverlayUpdate(std::move(bitmapList), env);
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeGetDrsScale(
        JNIEnv* env, jobject thiz, jlong engine_ptr) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    return enginePtr ? enginePtr->getDrsScale() : 1.0f;
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeSetStream(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject surfaceTexture) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        enginePtr->updateStream(surfaceTexture, env);
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeUpdateSwapChain(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject surface) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) return;
    
    if (surface) {
        ANativeWindow* window = ANativeWindow_fromSurface(env, surface);
        if (window) {
            enginePtr->updateSwapChain(window);
            ANativeWindow_release(window);
        }
    } else {
        enginePtr->updateSwapChain(nullptr);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeRenderLiveFrame(
        JNIEnv* env, jobject thiz, jlong engine_ptr,
        jfloatArray float_params, jfloatArray uv_matrix_in,
        jint cameraWidth, jint cameraHeight, jint viewportWidth, jint viewportHeight,
        jintArray out_fps_stats, jboolean skip_screen_render, jboolean isNewFrame) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr || !uv_matrix_in || !float_params) {
        return JNI_FALSE;
    }
    
    RenderParams parsedParams = parseRenderParams(env, float_params);

    try {
        // Extract input SurfaceTexture UV matrix
        jfloat* matrixElements = env->GetFloatArrayElements(uv_matrix_in, 0);
        float uvMatrixIn[16];
        for (int i = 0; i < 16; ++i) uvMatrixIn[i] = matrixElements[i];
        env->ReleaseFloatArrayElements(uv_matrix_in, matrixElements, JNI_ABORT);

        int actualFps = 0;
        int stampedFps = 0;
        bool fpsUpdated = false;

        bool rendered = enginePtr->renderLiveFrame(
            parsedParams, uvMatrixIn, cameraWidth, cameraHeight, viewportWidth, viewportHeight,
            skip_screen_render, isNewFrame, actualFps, stampedFps, fpsUpdated
        );

        if (out_fps_stats) {
            jint* fpsStats = env->GetIntArrayElements(out_fps_stats, 0);
            fpsStats[0] = fpsUpdated ? 1 : 0;
            fpsStats[1] = actualFps;
            fpsStats[2] = stampedFps;
            env->ReleaseIntArrayElements(out_fps_stats, fpsStats, 0);
        }

        return rendered ? JNI_TRUE : JNI_FALSE;

    } catch (const std::exception& e) {
        LOGE("Filament Exception in nativeRenderLiveFrame: %s", e.what());
        return JNI_FALSE;
    } catch (...) {
        LOGE("Unknown Exception in nativeRenderLiveFrame");
        return JNI_FALSE;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeSimulateFrameTime(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jfloat frame_time_ms) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        enginePtr->simulateFrameTime(frame_time_ms);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_logic_WatermarkEngine_nativeEmbedSignature(
        JNIEnv* env, jclass clazz, jobject bitmap) {
    AndroidBitmapInfo info;
    void* pixels = nullptr;
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0 || AndroidBitmap_lockPixels(env, bitmap, &pixels) < 0) {
        __android_log_print(ANDROID_LOG_ERROR, "GrovkornetJNI", "WatermarkEngine: Failed to lock bitmap pixels for embedding");
        return JNI_FALSE;
    }

    if (info.format != ANDROID_BITMAP_FORMAT_RGBA_8888) {
        __android_log_print(ANDROID_LOG_ERROR, "GrovkornetJNI", "WatermarkEngine: Bitmap format is not RGBA_8888 (got %d)", info.format);
        AndroidBitmap_unlockPixels(env, bitmap);
        return JNI_FALSE;
    }

    int stride = info.stride / 4;
    WatermarkEngine::embedSignature(reinterpret_cast<uint32_t*>(pixels), info.width, info.height, stride);

    AndroidBitmap_unlockPixels(env, bitmap);
    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_logic_WatermarkEngine_nativeVerifySignature(
        JNIEnv* env, jclass clazz, jobject bitmap) {
    AndroidBitmapInfo info;
    void* pixels = nullptr;
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0 || AndroidBitmap_lockPixels(env, bitmap, &pixels) < 0) {
        __android_log_print(ANDROID_LOG_ERROR, "GrovkornetJNI", "WatermarkEngine: Failed to lock bitmap pixels for verification");
        return JNI_FALSE;
    }

    if (info.format != ANDROID_BITMAP_FORMAT_RGBA_8888) {
        __android_log_print(ANDROID_LOG_ERROR, "GrovkornetJNI", "WatermarkEngine: Bitmap format is not RGBA_8888 (got %d)", info.format);
        AndroidBitmap_unlockPixels(env, bitmap);
        return JNI_FALSE;
    }

    int stride = info.stride / 4;
    bool verified = WatermarkEngine::verifySignature(reinterpret_cast<const uint32_t*>(pixels), info.width, info.height, stride);

    AndroidBitmap_unlockPixels(env, bitmap);
    return verified ? JNI_TRUE : JNI_FALSE;
}

} // extern "C"
