#include <jni.h>
#include <android/log.h>
#include <android/bitmap.h>
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <chrono>
#include <vector>

#include <filament/Engine.h>
#include <filament/Renderer.h>
#include <filament/Texture.h>
#include <filament/TextureSampler.h>
#include <filament/RenderableManager.h>

#include "grovkornet-engine.h"

#define LOG_TAG "GrovkornetJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

extern "C" {

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("Grovkornet Engine JNI Library Loaded Successfully");
    return JNI_VERSION_1_6;
}

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jlong engine_native_ptr, jint width, jint height) {
    filament::Engine* sharedEngine = reinterpret_cast<filament::Engine*>(engine_native_ptr);
    GrovkornetEngine* engine = new GrovkornetEngine(sharedEngine, width, height);
    env->GetJavaVM(&(engine->javaVm));
    if (!engine->init()) {
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
        jfloat chromatic_aberration, jfloat aberration_direction) {
    
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
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject hardware_buffer_obj,
        jfloat saturation, jfloat contrast, jfloat grain_intensity, jfloat grain_chroma,
        jfloat grain_size, jfloat vignette_intensity, jfloat vhs_intensity, jfloat time,
        jfloat ev, jfloat white_balance, jfloat tint, jfloat bloom_intensity,
        jfloat chromatic_aberration, jfloat aberration_direction) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) {
        LOGE("Invalid native engine pointer in nativeProcessHardwareBuffer");
        return;
    }

    // 1. Get AHardwareBuffer from the Kotlin/Java HardwareBuffer object
    AHardwareBuffer* hardwareBuffer = AHardwareBuffer_fromHardwareBuffer(env, hardware_buffer_obj);
    if (!hardwareBuffer) {
        LOGE("Failed to get AHardwareBuffer from Java HardwareBuffer");
        return;
    }

    AHardwareBuffer_Desc desc;
    AHardwareBuffer_describe(hardwareBuffer, &desc);

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

    // Map the hardware buffer to our external texture
    enginePtr->inputTextureExternal->setExternalImage(*(enginePtr->engine), hardwareBuffer);

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

// ==========================================
// LiveFilmProcessor JNI Bindings
// ==========================================

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jlong engine_native_ptr, jint width, jint height) {
    filament::Engine* sharedEngine = reinterpret_cast<filament::Engine*>(engine_native_ptr);
    GrovkornetEngine* engine = new GrovkornetEngine(sharedEngine, width, height);
    env->GetJavaVM(&(engine->javaVm));
    if (!engine->init()) {
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
        JNIEnv* env, jobject thiz, jlong engine_ptr, jlong stream_ptr) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    filament::Stream* stream = reinterpret_cast<filament::Stream*>(stream_ptr);
    if (enginePtr && stream) {
        enginePtr->setExternalStream(stream);
    }
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_LiveFilmProcessor_nativeRenderLiveFrame(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jlong swapchain_ptr,
        jfloat saturation, jfloat contrast, jfloat grain_intensity, jfloat grain_chroma,
        jfloat grain_size, jfloat vignette_intensity, jfloat vhs_intensity, jfloat time,
        jfloat ev, jfloat white_balance, jfloat tint, jfloat bloom_intensity,
        jfloat chromatic_aberration, jfloat aberration_direction, jfloatArray uv_matrix) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    filament::SwapChain* liveSwapChain = reinterpret_cast<filament::SwapChain*>(swapchain_ptr);
    if (!enginePtr || !liveSwapChain || !uv_matrix) {
        return;
    }
    
    // Convert jfloatArray to filament::math::mat4f
    jfloat* matrixElements = env->GetFloatArrayElements(uv_matrix, 0);
    filament::math::mat4f u_UvMatrix(
        matrixElements[0], matrixElements[1], matrixElements[2], matrixElements[3],
        matrixElements[4], matrixElements[5], matrixElements[6], matrixElements[7],
        matrixElements[8], matrixElements[9], matrixElements[10], matrixElements[11],
        matrixElements[12], matrixElements[13], matrixElements[14], matrixElements[15]
    );
    env->ReleaseFloatArrayElements(uv_matrix, matrixElements, 0);

    // 1. Update geometry to use the External material
    auto& rcm = enginePtr->engine->getRenderableManager();
    auto instance = rcm.getInstance(enginePtr->quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, enginePtr->shaderManager.getMaterialInstanceExternal());
    }
    
    // 2. Trigger LUT calculation on CPU and apply it to GPU texture
    enginePtr->triggerLutUpdate(saturation, contrast, ev, white_balance, tint);
    enginePtr->applyLutTextureUpdate();
    enginePtr->applyOverlayTextureUpdate();
    
    // 3. Set material parameters
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
    
    enginePtr->updateDrsAndViewport();
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // 4. Render
    if (enginePtr->renderer->beginFrame(liveSwapChain)) {
        enginePtr->renderer->render(enginePtr->viewGrading);
        if (bloom_intensity > 0.0f) {
            enginePtr->renderer->render(enginePtr->viewDownsample);
            enginePtr->renderer->render(enginePtr->viewBlurDown);
            enginePtr->renderer->render(enginePtr->viewBlurUp);
        }
        enginePtr->renderer->render(enginePtr->view);
        enginePtr->renderer->endFrame();
    }
    
    // Flush UI commands asynchronously (don't block the render thread with flushAndWait!)
    enginePtr->engine->flush();
    
    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    enginePtr->recordFrameTimeAndEvaluate(frameTimeMs);
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

} // extern "C"
