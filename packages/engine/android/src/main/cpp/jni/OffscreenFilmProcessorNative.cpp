#include <fbjni/fbjni.h>
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <android/bitmap.h>
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <android/log.h>
#include <vector>
#include "core/GrovkornetEngine.h"
#include "state/CameraStateManager.h"

#define LOG_TAG "OffscreenProcessorNative"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

extern JavaVM* g_javaVM;

namespace grovkornet {

class OffscreenFilmProcessorNative : public facebook::jni::HybridClass<OffscreenFilmProcessorNative> {
public:
    static auto constexpr kJavaDescriptor = "Lcom/grovkornet/nativefilmcamera/rendering/OffscreenFilmProcessorNative;";

    static void registerNatives() {
        registerHybrid({
            makeNativeMethod("initHybrid", OffscreenFilmProcessorNative::initHybrid),
            makeNativeMethod("prepare", OffscreenFilmProcessorNative::prepare),
            makeNativeMethod("processBitmap", OffscreenFilmProcessorNative::processBitmap),
            makeNativeMethod("processHardwareBuffer", OffscreenFilmProcessorNative::processHardwareBuffer),
            makeNativeMethod("updateOverlay", OffscreenFilmProcessorNative::updateOverlay),
            makeNativeMethod("getDrsScale", OffscreenFilmProcessorNative::getDrsScale),
            makeNativeMethod("simulateFrameTime", OffscreenFilmProcessorNative::simulateFrameTime),
            makeNativeMethod("release", OffscreenFilmProcessorNative::release),
        });
    }

    ~OffscreenFilmProcessorNative() override {
        release();
    }

private:
    friend HybridBase;
    GrovkornetEngine* m_engine = nullptr;

    static facebook::jni::local_ref<jhybriddata> initHybrid(facebook::jni::alias_ref<jclass>) {
        return makeCxxInstance();
    }

    void prepare(int width, int height, facebook::jni::alias_ref<facebook::jni::JObject> assetManager) {
        if (m_engine) {
            delete m_engine;
            m_engine = nullptr;
        }
        m_engine = new GrovkornetEngine(width, height);
        m_engine->javaVm = g_javaVM;
        
        JNIEnv* env = facebook::jni::Environment::current();
        AAssetManager* am = AAssetManager_fromJava(env, assetManager.get());
        if (!am) {
            delete m_engine;
            m_engine = nullptr;
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Failed to get AAssetManager from Java");
            return;
        }

        if (!m_engine->init(am)) {
            delete m_engine;
            m_engine = nullptr;
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Failed to initialize Filament Engine");
        }
    }

    void processBitmap(
        facebook::jni::alias_ref<facebook::jni::JObject> bitmapIn,
        facebook::jni::alias_ref<facebook::jni::JObject> bitmapOut,
        jlong statePtr,
        jboolean invertY
    ) {
        if (!m_engine) {
            facebook::jni::throwNewJavaException("java/lang/IllegalStateException", "Engine is not prepared");
            return;
        }

        JNIEnv* env = facebook::jni::Environment::current();
        void* pixelsIn = nullptr;
        void* pixelsOut = nullptr;

        if (AndroidBitmap_lockPixels(env, bitmapIn.get(), &pixelsIn) < 0) {
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Failed to lock input bitmap pixels");
            return;
        }

        if (AndroidBitmap_lockPixels(env, bitmapOut.get(), &pixelsOut) < 0) {
            AndroidBitmap_unlockPixels(env, bitmapIn.get());
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Failed to lock output bitmap pixels");
            return;
        }

        RenderState tempState;
        if (statePtr != 0) {
            tempState = *reinterpret_cast<const RenderState*>(statePtr);
        } else {
            tempState = *CameraStateManager::getInstance().getActiveState();
        }
        tempState.invertYShift = (invertY == JNI_TRUE);
        tempState.renderParams.deviceOrientation = 0.0f;

        try {
            m_engine->renderOffscreenFrame(pixelsIn, pixelsOut, &tempState);
            AndroidBitmap_unlockPixels(env, bitmapIn.get());
            AndroidBitmap_unlockPixels(env, bitmapOut.get());
        } catch (const std::exception& e) {
            AndroidBitmap_unlockPixels(env, bitmapIn.get());
            AndroidBitmap_unlockPixels(env, bitmapOut.get());
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", e.what());
        } catch (...) {
            AndroidBitmap_unlockPixels(env, bitmapIn.get());
            AndroidBitmap_unlockPixels(env, bitmapOut.get());
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Unknown C++ exception during render");
        }
    }

    void processHardwareBuffer(
        facebook::jni::alias_ref<facebook::jni::JObject> hardwareBuffer,
        jlong statePtr,
        jboolean invertY
    ) {
        if (!m_engine) {
            facebook::jni::throwNewJavaException("java/lang/IllegalStateException", "Engine is not prepared");
            return;
        }

        JNIEnv* env = facebook::jni::Environment::current();
        AHardwareBuffer* ahb = AHardwareBuffer_fromHardwareBuffer(env, hardwareBuffer.get());
        if (!ahb) {
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Failed to get AHardwareBuffer");
            return;
        }

        RenderState tempState;
        if (statePtr != 0) {
            tempState = *reinterpret_cast<const RenderState*>(statePtr);
        } else {
            tempState = *CameraStateManager::getInstance().getActiveState();
        }
        tempState.invertYShift = (invertY == JNI_TRUE);
        tempState.renderParams.deviceOrientation = 0.0f;

        try {
            m_engine->renderHardwareBufferFrame(ahb, &tempState);
        } catch (const std::exception& e) {
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", e.what());
        } catch (...) {
            facebook::jni::throwNewJavaException("java/lang/RuntimeException", "Unknown C++ exception during HardwareBuffer render");
        }
    }

    void updateOverlay(facebook::jni::alias_ref<facebook::jni::JObject> bitmaps) {
        if (!m_engine) return;
        
        std::vector<jobject> bitmapList;
        if (bitmaps) {
            JNIEnv* env = facebook::jni::Environment::current();
            jobjectArray array = static_cast<jobjectArray>(bitmaps.get());
            jsize len = env->GetArrayLength(array);
            for (jsize i = 0; i < len; ++i) {
                jobject bmp = env->GetObjectArrayElement(array, i);
                if (bmp) {
                    bitmapList.push_back(bmp);
                }
            }
        }
        m_engine->triggerOverlayUpdate(std::move(bitmapList), facebook::jni::Environment::current());
    }

    float getDrsScale() {
        return m_engine ? m_engine->getDrsScale() : 1.0f;
    }

    void simulateFrameTime(float frameTimeMs) {
        if (m_engine) {
            m_engine->simulateFrameTime(frameTimeMs);
        }
    }

    void release() {
        if (m_engine) {
            delete m_engine;
            m_engine = nullptr;
        }
    }
};

void registerOffscreenFilmProcessorNative() {
    OffscreenFilmProcessorNative::registerNatives();
}

} // namespace grovkornet
