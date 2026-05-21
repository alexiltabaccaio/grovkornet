#include <jni.h>
#include <android/log.h>
#include <android/bitmap.h>
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <android/native_window_jni.h>
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <chrono>
#include <vector>

#include <filament/Engine.h>
#include <filament/Renderer.h>
#include <filament/Texture.h>
#include <filament/TextureSampler.h>
#include <filament/RenderableManager.h>

#include "grovkornet-engine.h"
#include "WatermarkEngine.h"
#include "MatrixTransformCalculator.h"

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

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("Grovkornet Engine JNI Library Loaded Successfully");
    
    // Initialize Filament's JNI VirtualMachineEnv
    filament::VirtualMachineEnv::JNI_OnLoad(vm);
    
    return JNI_VERSION_1_6;
}

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jint width, jint height, jobject assetManagerObj) {
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
        jfloat saturation, jfloat contrast, jfloat grain_intensity, jfloat grain_chroma,
        jfloat grain_size, jfloat vignette_intensity, jfloat vhs_intensity, jfloat time,
        jfloat ev, jfloat white_balance, jfloat tint, jfloat bloom_intensity,
        jfloat chromatic_aberration, jfloat aberration_direction, jfloat sharpening) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) {
        LOGE("Invalid native engine pointer in nativeProcessBitmap");
        return;
    }
    
    // 1. Lock bitmap pixels
    AndroidBitmapInfo infoIn;
    void* pixelsIn = nullptr;
    if (AndroidBitmap_getInfo(env, bitmap_in, &infoIn) < 0 || AndroidBitmap_lockPixels(env, bitmap_in, &pixelsIn) < 0) {
        LOGE("Failed to lock input bitmap pixels");
        return;
    }
    
    AndroidBitmapInfo infoOut;
    void* pixelsOut = nullptr;
    if (AndroidBitmap_getInfo(env, bitmap_out, &infoOut) < 0 || AndroidBitmap_lockPixels(env, bitmap_out, &pixelsOut) < 0) {
        LOGE("Failed to lock output bitmap pixels");
        AndroidBitmap_unlockPixels(env, bitmap_in);
        return;
    }

    // 2. Setup or update input texture
    if (!enginePtr->inputTexture2D) {
        enginePtr->inputTexture2D = filament::Texture::Builder()
            .width(enginePtr->width)
            .height(enginePtr->height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_2D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*(enginePtr->engine));
    }

    // Upload input pixels to texture
    enginePtr->inputTexture2D->setImage(*(enginePtr->engine), 0, filament::Texture::PixelBufferDescriptor(
        pixelsIn, 
        enginePtr->width * enginePtr->height * 4, 
        filament::backend::PixelDataFormat::RGBA, 
        filament::backend::PixelDataType::UBYTE
    ));

    // 3. Update geometry to use the 2D material
    auto& rcm = enginePtr->engine->getRenderableManager();
    auto instance = rcm.getInstance(enginePtr->quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, enginePtr->shaderManager.getMaterialInstance2D());
    }

    // 4. Trigger LUT calculation on CPU and apply it to GPU texture
    enginePtr->triggerLutUpdate(saturation, contrast, ev, white_balance, tint);
    enginePtr->applyLutTextureUpdate();
    enginePtr->applyOverlayTextureUpdate();

    // Set material parameters
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    enginePtr->shaderManager.getMaterialInstance2D()->setParameter("u_Texture", enginePtr->inputTexture2D, sampler2d);
    
    filament::TextureSampler sampler3d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR, filament::TextureSampler::WrapMode::CLAMP_TO_EDGE);
    enginePtr->shaderManager.getMaterialInstance2D()->setParameter("u_LutTexture", enginePtr->lutTexture, sampler3d);

    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainIntensity", grain_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainChroma", grain_chroma);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainSize", grain_size);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_VignetteIntensity", vignette_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_VhsIntensity", vhs_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_Time", time);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_BloomIntensity", bloom_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_ChromaticAberration", chromatic_aberration);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_AberrationDirection", aberration_direction);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayEnabled", enginePtr->overlayCompositor.isOverlayEnabled() ? 1.0f : 0.0f);
    
    filament::math::float2 texelSize{1.0f / enginePtr->width, 1.0f / enginePtr->height};
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_TexelSize", texelSize);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_Sharpening", sharpening);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_TargetResolution", 0.0f);

    enginePtr->updateDrsAndViewport();

    auto start = std::chrono::high_resolution_clock::now();

    // 5. Render and readback inside frame boundary
    if (enginePtr->renderer->beginFrame(enginePtr->swapChain)) {
        enginePtr->renderer->render(enginePtr->viewGrading);
        if (bloom_intensity > 0.0f) {
            enginePtr->renderer->render(enginePtr->viewDownsample);
            enginePtr->renderer->render(enginePtr->viewBlurDown);
            enginePtr->renderer->render(enginePtr->viewBlurUp);
        }
        enginePtr->renderer->render(enginePtr->view);
        
        // 6. Read back pixels to output bitmap (must be before endFrame for SwapChain)
        filament::backend::PixelBufferDescriptor desc(
            pixelsOut, 
            enginePtr->width * enginePtr->height * 4, 
            filament::backend::PixelDataFormat::RGBA, 
            filament::backend::PixelDataType::UBYTE
        );
        enginePtr->renderer->readPixels(0, 0, enginePtr->width, enginePtr->height, std::move(desc));
        
        enginePtr->renderer->endFrame();
    }
    
    // Flush commands and wait for GPU completion (includes rendering and readback)
    enginePtr->engine->flushAndWait();

    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    enginePtr->recordFrameTimeAndEvaluate(frameTimeMs);

    // 7. Unlock bitmap pixels
    AndroidBitmap_unlockPixels(env, bitmap_in);
    AndroidBitmap_unlockPixels(env, bitmap_out);
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeProcessHardwareBuffer(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject hardwareBuffer, jfloatArray float_params) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr || !hardwareBuffer || !float_params) {
        return;
    }
    
    jfloat* params = env->GetFloatArrayElements(float_params, 0);
    jfloat saturation = params[0];
    jfloat contrast = params[1];
    jfloat grain_intensity = params[2];
    jfloat grain_chroma = params[3];
    jfloat grain_size = params[4];
    jfloat vignette_intensity = params[5];
    jfloat vhs_intensity = params[6];
    jfloat time = params[7];
    jfloat ev = params[8];
    jfloat white_balance = params[9];
    jfloat tint = params[10];
    jfloat bloom_intensity = params[11];
    jfloat chromatic_aberration = params[12];
    jfloat aberration_direction = params[13];
    jfloat sharpening = params[14];
    env->ReleaseFloatArrayElements(float_params, params, 0);
    
    AHardwareBuffer* ahb = AHardwareBuffer_fromHardwareBuffer(env, hardwareBuffer);
    if (!ahb) {
        LOGE("Failed to get AHardwareBuffer from Java HardwareBuffer");
        return;
    }

    AHardwareBuffer_Desc desc;
    AHardwareBuffer_describe(ahb, &desc);

    // 2. Setup or update external input texture
    if (!enginePtr->inputTextureExternal) {
        enginePtr->inputTextureExternal = filament::Texture::Builder()
            .width(desc.width)
            .height(desc.height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_EXTERNAL)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*(enginePtr->engine));
    }

    // Bind the AHardwareBuffer to the external texture
    enginePtr->inputTextureExternal->setExternalImage(*(enginePtr->engine), ahb);

    // 3. Update geometry to use the External material
    auto& rcm = enginePtr->engine->getRenderableManager();
    auto instance = rcm.getInstance(enginePtr->quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, enginePtr->shaderManager.getMaterialInstanceExternal());
    }

    // 4. Trigger LUT calculation on CPU and apply it to GPU texture
    enginePtr->triggerLutUpdate(saturation, contrast, ev, white_balance, tint);
    enginePtr->applyLutTextureUpdate();
    enginePtr->applyOverlayTextureUpdate();

    // Set material parameters
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    enginePtr->shaderManager.getMaterialInstanceExternal()->setParameter("u_Texture", enginePtr->inputTextureExternal, sampler2d);
    
    // Hardware buffers from CameraX ImageCapture are already upright, use identity matrix
    filament::math::mat4f identityMatrix;
    enginePtr->shaderManager.getMaterialInstanceExternal()->setParameter("u_UvMatrix", identityMatrix);
    
    filament::TextureSampler sampler3d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR, filament::TextureSampler::WrapMode::CLAMP_TO_EDGE);
    enginePtr->shaderManager.getMaterialInstanceExternal()->setParameter("u_LutTexture", enginePtr->lutTexture, sampler3d);

    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainIntensity", grain_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainChroma", grain_chroma);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainSize", grain_size);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_VignetteIntensity", vignette_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_VhsIntensity", vhs_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_Time", time);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_BloomIntensity", bloom_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_ChromaticAberration", chromatic_aberration);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_AberrationDirection", aberration_direction);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayEnabled", enginePtr->overlayCompositor.isOverlayEnabled() ? 1.0f : 0.0f);
    
    filament::math::float2 texelSize{1.0f / enginePtr->width, 1.0f / enginePtr->height};
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_TexelSize", texelSize);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_Sharpening", sharpening);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_TargetResolution", 0.0f);

    enginePtr->updateDrsAndViewport();

    auto start = std::chrono::high_resolution_clock::now();

    // 5. Render
    if (enginePtr->renderer->beginFrame(enginePtr->swapChain)) {
        enginePtr->renderer->render(enginePtr->viewGrading);
        if (bloom_intensity > 0.0f) {
            enginePtr->renderer->render(enginePtr->viewDownsample);
            enginePtr->renderer->render(enginePtr->viewBlurDown);
            enginePtr->renderer->render(enginePtr->viewBlurUp);
        }
        enginePtr->renderer->render(enginePtr->view);
        enginePtr->renderer->endFrame();
    }
    
    // Flush commands and wait for GPU completion
    enginePtr->engine->flushAndWait();

    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    enginePtr->recordFrameTimeAndEvaluate(frameTimeMs);
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
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        delete enginePtr;
    }
}

JNIEXPORT jfloat JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeGetDrsScale(
        JNIEnv* env, jobject thiz, jlong engine_ptr) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    return enginePtr ? enginePtr->currentDrsScale : 1.0f;
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeSimulateFrameTime(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jfloat frame_time_ms) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        enginePtr->framesSinceLastDrsScale = GrovkornetEngine::DRS_COOLDOWN_FRAMES;
        enginePtr->recordFrameTimeAndEvaluate(frame_time_ms);
    }
}

#include <android/asset_manager.h>

// ==========================================
// LiveFilmProcessor JNI Bindings
// ==========================================

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jint width, jint height, jobject assetManagerObj) {
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
    return enginePtr ? enginePtr->currentDrsScale : 1.0f;
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
    if (!enginePtr || !enginePtr->liveSwapChain || !uv_matrix_in || !float_params) {
        return JNI_FALSE;
    }
    
    // Extract parameters from float_params
    jfloat* params = env->GetFloatArrayElements(float_params, 0);
    jfloat saturation = params[0];
    jfloat contrast = params[1];
    jfloat grain_intensity = params[2];
    jfloat grain_chroma = params[3];
    jfloat grain_size = params[4];
    jfloat vignette_intensity = params[5];
    jfloat vhs_intensity = params[6];
    jfloat time = params[7];
    jfloat ev = params[8];
    jfloat white_balance = params[9];
    jfloat tint = params[10];
    jfloat bloom_intensity = params[11];
    jfloat chromatic_aberration = params[12];
    jfloat aberration_direction = params[13];
    jfloat sharpening = params[14];
    int targetFps = static_cast<int>(params[15]);
    int aspectRatioSetting = static_cast<int>(params[16]);
    float targetResolution = params[17];
    env->ReleaseFloatArrayElements(float_params, params, 0);

    // 1. Run Frame Timing checks natively
    bool shouldCapture = enginePtr->timingController.shouldCaptureFrame(targetFps);
    
    // Update FPS statistics
    int actualFps = 0;
    int stampedFps = 0;
    bool fpsUpdated = false;
    enginePtr->timingController.updateFps(isNewFrame, actualFps, stampedFps, fpsUpdated);
    
    if (out_fps_stats) {
        jint* fpsStats = env->GetIntArrayElements(out_fps_stats, 0);
        fpsStats[0] = fpsUpdated ? 1 : 0;
        fpsStats[1] = actualFps;
        fpsStats[2] = stampedFps;
        env->ReleaseIntArrayElements(out_fps_stats, fpsStats, 0);
    }
    
    if (!shouldCapture) {
        return JNI_FALSE;
    }

    // 2. Perform aspect ratio matrix calculations natively
    float scaleMatrix[16];
    float cropMatrix[16];
    MatrixTransformCalculator::calculateScaleAndCrop(
        cameraWidth, cameraHeight, viewportWidth, viewportHeight, aspectRatioSetting, scaleMatrix, cropMatrix
    );

    // Extract input SurfaceTexture UV matrix
    jfloat* matrixElements = env->GetFloatArrayElements(uv_matrix_in, 0);
    float uvMatrixIn[16];
    for (int i = 0; i < 16; ++i) uvMatrixIn[i] = matrixElements[i];
    env->ReleaseFloatArrayElements(uv_matrix_in, matrixElements, 0);

    // Multiply input UV matrix by calculated crop matrix to get final UV matrix
    float finalUvMatrix[16];
    MatrixTransformCalculator::multiplyMM(finalUvMatrix, uvMatrixIn, cropMatrix);

    filament::math::mat4f u_UvMatrix(
        finalUvMatrix[0], finalUvMatrix[1], finalUvMatrix[2], finalUvMatrix[3],
        finalUvMatrix[4], finalUvMatrix[5], finalUvMatrix[6], finalUvMatrix[7],
        finalUvMatrix[8], finalUvMatrix[9], finalUvMatrix[10], finalUvMatrix[11],
        finalUvMatrix[12], finalUvMatrix[13], finalUvMatrix[14], finalUvMatrix[15]
    );

    // Calculate viewport based on scale matrix
    float scaleX = scaleMatrix[0];
    float scaleY = scaleMatrix[5];
    int vpWidth = static_cast<int>(viewportWidth * scaleX);
    int vpHeight = static_cast<int>(viewportHeight * scaleY);
    int vpX = (viewportWidth - vpWidth) / 2;
    int vpY = (viewportHeight - vpHeight) / 2;

    // Update viewport in engine
    enginePtr->viewportX = vpX;
    enginePtr->viewportY = vpY;
    enginePtr->viewportWidth = vpWidth;
    enginePtr->viewportHeight = vpHeight;

    // 3. Update geometry to use the External material
    auto& rcm = enginePtr->engine->getRenderableManager();
    auto instance = rcm.getInstance(enginePtr->quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, enginePtr->shaderManager.getMaterialInstanceExternal());
    }
    
    // 4. Trigger LUT calculation on CPU and apply it to GPU texture
    enginePtr->triggerLutUpdate(saturation, contrast, ev, white_balance, tint);
    enginePtr->applyLutTextureUpdate();
    enginePtr->applyOverlayTextureUpdate();
    
    // 5. Set material parameters
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    enginePtr->shaderManager.getMaterialInstanceExternal()->setParameter("u_Texture", enginePtr->inputTextureExternal, sampler2d);
    enginePtr->shaderManager.getMaterialInstanceExternal()->setParameter("u_UvMatrix", u_UvMatrix);
    
    filament::TextureSampler sampler3d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR, filament::TextureSampler::WrapMode::CLAMP_TO_EDGE);
    enginePtr->shaderManager.getMaterialInstanceExternal()->setParameter("u_LutTexture", enginePtr->lutTexture, sampler3d);
    
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainIntensity", grain_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainChroma", grain_chroma);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainSize", grain_size);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_VignetteIntensity", vignette_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_VhsIntensity", vhs_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_Time", time);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_BloomIntensity", bloom_intensity);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_ChromaticAberration", chromatic_aberration);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_AberrationDirection", aberration_direction);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayEnabled", enginePtr->overlayCompositor.isOverlayEnabled() ? 1.0f : 0.0f);
    
    filament::math::float2 texelSize{1.0f / enginePtr->width, 1.0f / enginePtr->height};
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_TexelSize", texelSize);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_Sharpening", sharpening);
    enginePtr->shaderManager.getMaterialInstanceComposite()->setParameter("u_TargetResolution", targetResolution);
    
    enginePtr->updateDrsAndViewport();
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // 6. Render
    if (enginePtr->renderer->beginFrame(enginePtr->liveSwapChain)) {
        enginePtr->renderer->render(enginePtr->viewGrading);
        if (bloom_intensity > 0.0f) {
            enginePtr->renderer->render(enginePtr->viewDownsample);
            enginePtr->renderer->render(enginePtr->viewBlurDown);
            enginePtr->renderer->render(enginePtr->viewBlurUp);
        }
        if (!skip_screen_render) {
            enginePtr->renderer->render(enginePtr->view);
        }
        enginePtr->renderer->endFrame();
    }
    
    // Flush UI commands asynchronously (don't block the render thread with flushAndWait!)
    enginePtr->engine->flush();
    
    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    enginePtr->recordFrameTimeAndEvaluate(frameTimeMs);

    return JNI_TRUE;
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeSimulateFrameTime(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jfloat frame_time_ms) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        enginePtr->framesSinceLastDrsScale = GrovkornetEngine::DRS_COOLDOWN_FRAMES;
        enginePtr->recordFrameTimeAndEvaluate(frame_time_ms);
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
