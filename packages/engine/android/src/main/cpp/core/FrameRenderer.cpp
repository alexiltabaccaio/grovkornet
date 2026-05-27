#include "FrameRenderer.h"
#include "GrovkornetEngine.h"
#include "utils/MatrixTransformCalculator.h"
#include <chrono>
#include <android/log.h>

#include <filament/Engine.h>
#include <filament/Viewport.h>
#include <filament/Renderer.h>
#include <filament/SwapChain.h>
#include <filament/View.h>
#include <filament/Scene.h>
#include <filament/Camera.h>
#include <filament/Texture.h>
#include <filament/Material.h>
#include <filament/MaterialInstance.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <filament/RenderableManager.h>
#include <filament/TextureSampler.h>
#include <filament/RenderTarget.h>
#include <math/vec2.h>
#include <utils/EntityManager.h>

#define LOG_TAG "FrameRenderer"
#ifdef NDEBUG
#define LOGI(...) ((void)0)
#define LOGW(...) ((void)0)
#else
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#endif
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

bool FrameRenderer::renderOffscreenFrame(GrovkornetEngine& gEngine, void* pixelsIn, void* pixelsOut, const RenderParams& params) {
    if (!pixelsIn || !pixelsOut) {
        return false;
    }

    // Setup or update input texture
    if (!gEngine.inputTexture2D) {
        gEngine.inputTexture2D = filament::Texture::Builder()
            .width(gEngine.width)
            .height(gEngine.height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_2D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*gEngine.engine);
    }

    // Upload input pixels to texture
    gEngine.inputTexture2D->setImage(*gEngine.engine, 0, filament::Texture::PixelBufferDescriptor(
        pixelsIn, 
        gEngine.width * gEngine.height * 4, 
        filament::backend::PixelDataFormat::RGBA, 
        filament::backend::PixelDataType::UBYTE
    ));

    // Update geometry to use the 2D material
    auto& rcm = gEngine.engine->getRenderableManager();
    auto instance = rcm.getInstance(gEngine.pipelineRenderer.quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, gEngine.shaderManager.getMaterialInstance2D());
    }

    // Set material parameter u_Texture
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    gEngine.shaderManager.getMaterialInstance2D()->setParameter("u_Texture", gEngine.inputTexture2D, sampler2d);

    // Apply unified parameters (waitForLut = true)
    gEngine.applyShaderParameters(params, gEngine.shaderManager.getMaterialInstance2D(), true);

    auto start = std::chrono::high_resolution_clock::now();

    // Render and readback
    if (gEngine.renderer->beginFrame(gEngine.swapChain)) {
        gEngine.renderer->render(gEngine.pipelineRenderer.viewGrading);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewDownsample);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewBlurDown);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewBlurUp);
        gEngine.renderer->render(gEngine.view);
        
        filament::backend::PixelBufferDescriptor desc(
            pixelsOut, 
            gEngine.width * gEngine.height * 4, 
            filament::backend::PixelDataFormat::RGBA, 
            filament::backend::PixelDataType::UBYTE
        );
        gEngine.renderer->readPixels(0, 0, gEngine.width, gEngine.height, std::move(desc));
        gEngine.renderer->endFrame();
    }
    gEngine.engine->flushAndWait();

    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    gEngine.recordFrameTimeAndEvaluate(frameTimeMs);

    return true;
}

bool FrameRenderer::renderHardwareBufferFrame(GrovkornetEngine& gEngine, AHardwareBuffer* ahb, const RenderParams& params) {
    if (!ahb) {
        return false;
    }

    AHardwareBuffer_Desc desc;
    AHardwareBuffer_describe(ahb, &desc);

    // Setup or update external input texture
    if (!gEngine.inputTextureExternal) {
        gEngine.inputTextureExternal = filament::Texture::Builder()
            .width(desc.width)
            .height(desc.height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_EXTERNAL)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*gEngine.engine);
    }

    // Bind the AHardwareBuffer to the external texture
    gEngine.inputTextureExternal->setExternalImage(*gEngine.engine, ahb);

    // Update geometry to use the External material
    auto& rcm = gEngine.engine->getRenderableManager();
    auto instance = rcm.getInstance(gEngine.pipelineRenderer.quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, gEngine.shaderManager.getMaterialInstanceExternal());
    }

    // Set material parameter u_Texture and u_UvMatrix
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    gEngine.shaderManager.getMaterialInstanceExternal()->setParameter("u_Texture", gEngine.inputTextureExternal, sampler2d);
    
    filament::math::mat4f identityMatrix;
    gEngine.shaderManager.getMaterialInstanceExternal()->setParameter("u_UvMatrix", identityMatrix);

    // Apply unified parameters (waitForLut = true)
    gEngine.applyShaderParameters(params, gEngine.shaderManager.getMaterialInstanceExternal(), true);

    auto start = std::chrono::high_resolution_clock::now();

    // Render
    if (gEngine.renderer->beginFrame(gEngine.swapChain)) {
        gEngine.renderer->render(gEngine.pipelineRenderer.viewGrading);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewDownsample);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewBlurDown);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewBlurUp);
        gEngine.renderer->render(gEngine.view);
        gEngine.renderer->endFrame();
    }
    gEngine.engine->flushAndWait();

    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    gEngine.recordFrameTimeAndEvaluate(frameTimeMs);

    return true;
}

bool FrameRenderer::renderLiveFrame(GrovkornetEngine& gEngine, const RenderParams& params, const float* uvMatrixIn,
                                     int cameraWidth, int cameraHeight, int vpW, int vpH,
                                     bool skipScreenRender, bool isNewFrame,
                                     int& actualFps, int& stampedFps, bool& fpsUpdated) {
    if (!gEngine.liveSwapChain || !uvMatrixIn) {
        return false;
    }

    int targetFps          = static_cast<int>(params.targetFps);
    int aspectRatioSetting = static_cast<int>(params.aspectRatio);

    // 1. Run Frame Timing checks natively
    bool shouldCapture = gEngine.timingController.shouldCaptureFrame(targetFps);
    
    // Update FPS statistics
    gEngine.timingController.updateFps(isNewFrame, actualFps, stampedFps, fpsUpdated);
    
    if (!shouldCapture) {
        return false;
    }

    // 2. Perform aspect ratio matrix calculations natively
    float scaleMatrix[16];
    float cropMatrix[16];
    MatrixTransformCalculator::calculateScaleAndCrop(
        cameraWidth, cameraHeight, vpW, vpH, aspectRatioSetting, scaleMatrix, cropMatrix
    );

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
    ViewportRect vpRect = MatrixTransformCalculator::calculateViewport(scaleMatrix, vpW, vpH);

    // Update viewport in engine
    gEngine.viewportX = vpRect.x;
    gEngine.viewportY = vpRect.y;
    gEngine.viewportWidth = vpRect.width;
    gEngine.viewportHeight = vpRect.height;

    // Update geometry to use the External material
    auto& rcm = gEngine.engine->getRenderableManager();
    auto instance = rcm.getInstance(gEngine.pipelineRenderer.quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, gEngine.shaderManager.getMaterialInstanceExternal());
    }
    
    // Set material parameter u_Texture and u_UvMatrix
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    gEngine.shaderManager.getMaterialInstanceExternal()->setParameter("u_Texture", gEngine.inputTextureExternal, sampler2d);
    gEngine.shaderManager.getMaterialInstanceExternal()->setParameter("u_UvMatrix", u_UvMatrix);
    
    // Apply unified parameters (waitForLut = false)
    gEngine.applyShaderParameters(params, gEngine.shaderManager.getMaterialInstanceExternal(), false);
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // Render
    if (gEngine.renderer->beginFrame(gEngine.liveSwapChain)) {
        gEngine.renderer->render(gEngine.pipelineRenderer.viewGrading);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewDownsample);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewBlurDown);
        gEngine.renderer->render(gEngine.pipelineRenderer.viewBlurUp);
        if (!skipScreenRender) {
            gEngine.renderer->render(gEngine.view);
        }
        gEngine.renderer->endFrame();
    }
    
    // Flush UI commands asynchronously (don't block the render thread!)
    gEngine.engine->flush();
    
    auto end = std::chrono::high_resolution_clock::now();
    float frameTimeMs = std::chrono::duration<float, std::milli>(end - start).count();
    gEngine.recordFrameTimeAndEvaluate(frameTimeMs);

    return true;
}
