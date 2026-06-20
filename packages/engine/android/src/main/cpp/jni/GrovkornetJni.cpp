// ⚠️ AI WARNING: Before modifying this core native JNI bridge, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
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
#include <fbjni/fbjni.h>
#include "grovkornet_engineOnLoad.hpp"

static std::mutex g_engineLifecycleMutex;

#include <filament/Engine.h>
#include <filament/Renderer.h>
#include <filament/Texture.h>
#include <filament/TextureSampler.h>
#include <filament/RenderableManager.h>

#include "core/GrovkornetEngine.h"
#include "utils/WatermarkEngine.h"

#define LOG_TAG "GrovkornetJNI"
#ifdef NDEBUG
#define LOGI(...) ((void)0)
#else
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#endif
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace filament {
class VirtualMachineEnv {
public:
    static jint JNI_OnLoad(JavaVM* vm) noexcept;
};
}

extern "C" {


JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("Grovkornet Engine JNI Library Loaded Successfully");
    
    // Initialize Filament's JNI VirtualMachineEnv
    filament::VirtualMachineEnv::JNI_OnLoad(vm);
    
    facebook::jni::initialize(vm, [vm]() {
        margelo::nitro::grovkornet::registerAllNatives();
    });
    
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
        jlong state_ptr, jboolean invert_y) {
    
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

        RenderState tempState;
        if (state_ptr != 0) {
            tempState = *reinterpret_cast<const RenderState*>(state_ptr);
        } else {
            tempState = *CameraStateManager::getInstance().getActiveState();
        }
        tempState.invertYShift = (invert_y == JNI_TRUE);

        // Call the engine's offscreen rendering method
        enginePtr->renderOffscreenFrame(inLocker.pixels, outLocker.pixels, &tempState);
        
    } catch (const std::exception& e) {
        LOGE("Filament Exception in nativeProcessBitmap: %s", e.what());
    } catch (...) {
        LOGE("Unknown Exception in nativeProcessBitmap");
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeProcessHardwareBuffer(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject hardwareBuffer, jlong state_ptr, jboolean invert_y) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr || !hardwareBuffer) {
        return;
    }
    
    RenderState tempState;
    if (state_ptr != 0) {
        tempState = *reinterpret_cast<const RenderState*>(state_ptr);
    } else {
        tempState = *CameraStateManager::getInstance().getActiveState();
    }
    tempState.invertYShift = (invert_y == JNI_TRUE);
    
    try {
        AHardwareBuffer* ahb = AHardwareBuffer_fromHardwareBuffer(env, hardwareBuffer);
        if (!ahb) {
            LOGE("Failed to get AHardwareBuffer from Java HardwareBuffer");
            return;
        }

        enginePtr->renderHardwareBufferFrame(ahb, &tempState);

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
        jlong state_ptr, jfloatArray uv_matrix_in,
        jint cameraWidth, jint cameraHeight, jint viewportWidth, jint viewportHeight,
        jintArray out_fps_stats, jboolean skip_screen_render, jboolean isNewFrame) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr || !uv_matrix_in) {
        return JNI_FALSE;
    }
    
    const RenderState* activeState = nullptr;
    if (state_ptr != 0) {
        activeState = reinterpret_cast<const RenderState*>(state_ptr);
    }

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
            activeState, uvMatrixIn, cameraWidth, cameraHeight, viewportWidth, viewportHeight,
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

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_nativeCreateState(JNIEnv* env, jclass clazz) {
    return reinterpret_cast<jlong>(new RenderState());
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_nativeFreeState(JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr != 0) {
        delete reinterpret_cast<RenderState*>(statePtr);
    }
}

// @@GEN_JNI_BINDINGS_START@@
// ⚠️ AI & MANUAL WARNING: DO NOT EDIT THIS SECTION!
// This block is auto-generated by codegen. To modify, edit the configs in packages/shared/camera-parameters/
// or packages/shared/camera-errors.yaml, then run `npm run codegen`.
JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSaturation(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.saturation;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.saturation;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSaturation(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.saturation = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.saturation = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getContrast(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.contrast;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.contrast;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setContrast(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.contrast = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.contrast = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getGrainIntensity(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.grainIntensity;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.grainIntensity;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setGrainIntensity(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.grainIntensity = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.grainIntensity = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getGrainChroma(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.grainChroma;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.grainChroma;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setGrainChroma(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.grainChroma = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.grainChroma = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getGrainSize(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.grainSize;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.grainSize;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setGrainSize(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.grainSize = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.grainSize = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getGrainSpeed(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.grainSpeed;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.grainSpeed;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setGrainSpeed(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.grainSpeed = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.grainSpeed = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getVignetteIntensity(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.vignetteIntensity;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.vignetteIntensity;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setVignetteIntensity(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.vignetteIntensity = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.vignetteIntensity = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getChromaShift(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.chromaShift;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.chromaShift;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setChromaShift(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.chromaShift = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.chromaShift = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getWhiteBalance(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.whiteBalance;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.whiteBalance;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setWhiteBalance(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.whiteBalance = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.whiteBalance = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getTint(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.tint;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.tint;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setTint(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.tint = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.tint = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBloomIntensity(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.bloomIntensity;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.bloomIntensity;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBloomIntensity(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.bloomIntensity = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.bloomIntensity = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getAberration(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.chromaticAberration;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.chromaticAberration;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setAberration(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.chromaticAberration = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.chromaticAberration = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getChromaShiftDirection(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.chromaShiftDirection;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.chromaShiftDirection;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setChromaShiftDirection(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.chromaShiftDirection = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.chromaShiftDirection = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSharpening(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.sharpening;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.sharpening;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSharpening(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.sharpening = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.sharpening = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatRed(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satRed;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satRed;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatRed(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satRed = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satRed = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatOrange(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satOrange;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satOrange;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatOrange(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satOrange = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satOrange = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatYellow(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satYellow;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satYellow;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatYellow(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satYellow = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satYellow = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatGreen(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satGreen;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satGreen;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatGreen(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satGreen = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satGreen = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatCyan(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satCyan;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satCyan;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatCyan(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satCyan = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satCyan = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatBlue(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satBlue;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satBlue;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatBlue(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satBlue = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satBlue = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatPurple(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satPurple;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satPurple;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatPurple(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satPurple = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satPurple = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSatMagenta(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.satMagenta;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.satMagenta;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSatMagenta(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.satMagenta = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.satMagenta = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getAberrationInvert(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.aberrationInvert;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.aberrationInvert;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setAberrationInvert(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.aberrationInvert = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.aberrationInvert = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundMagentaRed(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundMagentaRed;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundMagentaRed;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundMagentaRed(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundMagentaRed = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundMagentaRed = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundRedOrange(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundRedOrange;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundRedOrange;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundRedOrange(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundRedOrange = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundRedOrange = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundOrangeYellow(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundOrangeYellow;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundOrangeYellow;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundOrangeYellow(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundOrangeYellow = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundOrangeYellow = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundYellowGreen(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundYellowGreen;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundYellowGreen;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundYellowGreen(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundYellowGreen = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundYellowGreen = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundGreenCyan(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundGreenCyan;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundGreenCyan;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundGreenCyan(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundGreenCyan = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundGreenCyan = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundCyanBlue(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundCyanBlue;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundCyanBlue;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundCyanBlue(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundCyanBlue = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundCyanBlue = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundBluePurple(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundBluePurple;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundBluePurple;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundBluePurple(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundBluePurple = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundBluePurple = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBoundPurpleMagenta(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.boundPurpleMagenta;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.boundPurpleMagenta;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBoundPurpleMagenta(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.boundPurpleMagenta = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.boundPurpleMagenta = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getGrainRoughness(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.grainRoughness;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.grainRoughness;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setGrainRoughness(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.grainRoughness = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.grainRoughness = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getPanelY(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.panelY;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.panelY;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setPanelY(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.panelY = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.panelY = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getGrainEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.grainEnabled;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.grainEnabled;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setGrainEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.grainEnabled = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.grainEnabled = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBloomEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.bloomEnabled;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.bloomEnabled;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBloomEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.bloomEnabled = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.bloomEnabled = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBlackLevel(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.blackLevel;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.blackLevel;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBlackLevel(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.blackLevel = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.blackLevel = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHighlights(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.highlights;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.highlights;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHighlights(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.highlights = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.highlights = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getPivot(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.pivot;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.pivot;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setPivot(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.pivot = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.pivot = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getContrastAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.contrastAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.contrastAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setContrastAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.contrastAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.contrastAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getBlackLevelAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.blackLevelAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.blackLevelAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setBlackLevelAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.blackLevelAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.blackLevelAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHighlightsAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.highlightsAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.highlightsAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHighlightsAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.highlightsAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.highlightsAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getPivotAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.pivotAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.pivotAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setPivotAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.pivotAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.pivotAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getPixelationFactor(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.pixelationFactor;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.pixelationFactor;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setPixelationFactor(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.pixelationFactor = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.pixelationFactor = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getTapeJitter(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.tapeJitter;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.tapeJitter;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setTapeJitter(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.tapeJitter = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.tapeJitter = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getScanlines(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.scanlines;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.scanlines;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setScanlines(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.scanlines = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.scanlines = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getChromaShiftInvert(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.chromaShiftInvert;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.chromaShiftInvert;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setChromaShiftInvert(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.chromaShiftInvert = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.chromaShiftInvert = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHue(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hue;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hue;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHue(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hue = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hue = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueRed(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueRed;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueRed;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueRed(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueRed = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueRed = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueOrange(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueOrange;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueOrange;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueOrange(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueOrange = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueOrange = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueYellow(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueYellow;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueYellow;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueYellow(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueYellow = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueYellow = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueGreen(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueGreen;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueGreen;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueGreen(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueGreen = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueGreen = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueCyan(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueCyan;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueCyan;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueCyan(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueCyan = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueCyan = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueBlue(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueBlue;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueBlue;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueBlue(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueBlue = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueBlue = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHuePurple(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.huePurple;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.huePurple;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHuePurple(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.huePurple = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.huePurple = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getHueMagenta(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.hueMagenta;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.hueMagenta;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setHueMagenta(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.hueMagenta = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.hueMagenta = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getScanlinesHorizontal(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.scanlinesHorizontal;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.scanlinesHorizontal;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setScanlinesHorizontal(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.scanlinesHorizontal = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.scanlinesHorizontal = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getScanlinesMode(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.scanlinesMode;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.scanlinesMode;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setScanlinesMode(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.scanlinesMode = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.scanlinesMode = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getScanlinesDensity(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.scanlinesDensity;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.scanlinesDensity;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setScanlinesDensity(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.scanlinesDensity = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.scanlinesDensity = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getLensDistortion(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->renderParams.lensDistortion;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->renderParams.lensDistortion;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setLensDistortion(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.renderParams.lensDistortion = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->renderParams.lensDistortion = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getEv(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->ev;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->ev;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setEv(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.ev = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->ev = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getTargetFps(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->targetFps;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->targetFps;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setTargetFps(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.targetFps = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->targetFps = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getAspectRatio(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->aspectRatio;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->aspectRatio;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setAspectRatio(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.aspectRatio = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->aspectRatio = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getNoiseReduction(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->noiseReduction;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->noiseReduction;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setNoiseReduction(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.noiseReduction = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->noiseReduction = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getIsoAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->isoAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->isoAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setIsoAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.isoAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->isoAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getShutterSpeedAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->shutterSpeedAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->shutterSpeedAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setShutterSpeedAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.shutterSpeedAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->shutterSpeedAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getWhiteBalanceAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->whiteBalanceAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->whiteBalanceAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setWhiteBalanceAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.whiteBalanceAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->whiteBalanceAuto = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getAutoFocus(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->autoFocus;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->autoFocus;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setAutoFocus(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.autoFocus = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->autoFocus = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getIso(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->iso;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->iso;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setIso(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.iso = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->iso = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getExposureTime(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->exposureTime;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->exposureTime;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setExposureTime(
        JNIEnv* env, jclass clazz, jlong statePtr, jlong value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.exposureTime = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->exposureTime = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getFocusDistance(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->focusDistance;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->focusDistance;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setFocusDistance(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.focusDistance = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->focusDistance = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getTorchEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->torchEnabled;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->torchEnabled;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setTorchEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.torchEnabled = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->torchEnabled = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getTorchStrength(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->torchStrength;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->torchStrength;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setTorchStrength(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.torchStrength = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->torchStrength = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jstring JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getCameraId(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        std::string val = CameraStateManager::getInstance().getActiveState()->cameraId;
        return env->NewStringUTF(val.c_str());
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return env->NewStringUTF(state->cameraId.c_str());
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setCameraId(
        JNIEnv* env, jclass clazz, jlong statePtr, jstring value) {
    const char* nativeString = value ? env->GetStringUTFChars(value, nullptr) : nullptr;
    std::string cppVal = nativeString ? nativeString : "";
    if (nativeString) env->ReleaseStringUTFChars(value, nativeString);
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([cppVal](RenderState& state) {
            state.cameraId = cppVal;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->cameraId = cppVal;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getResolutionSetting(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->resolutionSetting;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->resolutionSetting;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setResolutionSetting(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.resolutionSetting = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->resolutionSetting = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getPreviewQuality(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->previewQuality;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->previewQuality;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setPreviewQuality(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.previewQuality = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->previewQuality = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getForce60fpsCrop(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->force60fpsCrop;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->force60fpsCrop;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setForce60fpsCrop(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.force60fpsCrop = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->force60fpsCrop = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getSecureViewEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->secureViewEnabled;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->secureViewEnabled;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setSecureViewEnabled(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.secureViewEnabled = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->secureViewEnabled = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jboolean JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getIsSelfieCamera(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->isSelfieCamera;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->isSelfieCamera;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setIsSelfieCamera(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.isSelfieCamera = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->isSelfieCamera = (value == JNI_TRUE);
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getZoom(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->zoom;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->zoom;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setZoom(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.zoom = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->zoom = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getViewportWidth(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->viewportWidth;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->viewportWidth;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setViewportWidth(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.viewportWidth = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->viewportWidth = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getViewportHeight(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->viewportHeight;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->viewportHeight;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setViewportHeight(
        JNIEnv* env, jclass clazz, jlong statePtr, jfloat value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.viewportHeight = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->viewportHeight = value;
        CameraStateManager::getInstance().clampState(*state);
    }
}
// @@GEN_JNI_BINDINGS_END@@

} // extern "C"
