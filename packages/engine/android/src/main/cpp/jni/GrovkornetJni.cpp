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

namespace grovkornet {
    void registerOffscreenFilmProcessorNative();
}

JavaVM* g_javaVM = nullptr;

extern "C" {

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("Grovkornet Engine JNI Library Loaded Successfully");
    g_javaVM = vm;
    
    // Initialize Filament's JNI VirtualMachineEnv
    filament::VirtualMachineEnv::JNI_OnLoad(vm);
    
    facebook::jni::initialize(vm, [vm]() {
        margelo::nitro::grovkornet::registerAllNatives();
        grovkornet::registerOffscreenFilmProcessorNative();
    });
    
    return JNI_VERSION_1_6;
}

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

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_nativeCopyActiveState(JNIEnv* env, jclass clazz) {
    return reinterpret_cast<jlong>(new RenderState(*CameraStateManager::getInstance().getActiveState()));
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
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getNoiseReductionAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->noiseReductionAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->noiseReductionAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setNoiseReductionAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.noiseReductionAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->noiseReductionAuto = (value == JNI_TRUE);
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
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getTemperatureAuto(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->temperatureAuto;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->temperatureAuto;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setTemperatureAuto(
        JNIEnv* env, jclass clazz, jlong statePtr, jboolean value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.temperatureAuto = (value == JNI_TRUE);
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->temperatureAuto = (value == JNI_TRUE);
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

JNIEXPORT jint JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_getStabilizationMode(
        JNIEnv* env, jclass clazz, jlong statePtr) {
    if (statePtr == 0) {
        return CameraStateManager::getInstance().getActiveState()->stabilizationMode;
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        return state->stabilizationMode;
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_jni_CameraStateJNI_setStabilizationMode(
        JNIEnv* env, jclass clazz, jlong statePtr, jint value) {
    if (statePtr == 0) {
        CameraStateManager::getInstance().updateStateField([value](RenderState& state) {
            state.stabilizationMode = value;
        });
    } else {
        auto* state = reinterpret_cast<RenderState*>(statePtr);
        state->stabilizationMode = value;
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
