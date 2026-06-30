// ⚠️ AI WARNING: Before modifying this core native engine file, query the dependency graph: node packages/shared/scripts/graphrag/query.js <query>
#include "GrovkornetEngine.h"
#include "FrameRenderer.h"
#include <android/log.h>
#include <chrono>
#include <cmath>

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

#include "pipeline/GeometryBuilder.h"

#define LOG_TAG "GrovkornetEngine"
#ifdef NDEBUG
#define LOGI(...) ((void)0)
#define LOGW(...) ((void)0)
#else
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#endif
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)



GrovkornetEngine::GrovkornetEngine(int w, int h) 
    : width(w), height(h), overlayCompositor(w, h) {
}

bool GrovkornetEngine::init(AAssetManager* assetManager) {
    LOGI("Initializing GrovkornetEngine for size %dx%d...", width, height);
    
    engine = filament::Engine::create();
    if (!engine) {
        LOGE("Failed to create native Filament Engine!");
        return false;
    }
    
    renderer = engine->createRenderer();
    
    // Set clear color to #0e0e0e to fill letterboxing margins automatically
    filament::Renderer::ClearOptions clearOpts;
    clearOpts.clearColor = {0.05490196f, 0.05490196f, 0.05490196f, 1.0f};
    clearOpts.clear = true;
    renderer->setClearOptions(clearOpts);
    
    // Create views and scenes
    view = engine->createView();
    scene = engine->createScene();
    
    // Shader manager initializes the filament materials from assets
    if (!shaderManager.init(*engine, assetManager)) {
        LOGE("Failed to initialize ShaderManager!");
        return false;
    }
    
    utils::Entity cameraEntity = utils::EntityManager::get().create();
    camera = engine->createCamera(cameraEntity);
    
    // Orthographic projection for 2D quads
    camera->setProjection(filament::Camera::Projection::ORTHO, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    
    // Set cameras and scenes for all views
    view->setCamera(camera);
    view->setScene(scene);
    view->setViewport(filament::Viewport(0, 0, width, height));
    view->setPostProcessingEnabled(false);
    
    swapChain = engine->createSwapChain(width, height, filament::SwapChain::CONFIG_READABLE);
    if (!swapChain) {
        LOGE("Failed to create headless SwapChain");
        return false;
    }
    
    // Initialize Geometry
    GeometryBuilder::buildQuad(*engine, vertexBuffer, indexBuffer);
    
    // Initialize PipelineRenderer
    if (!pipelineRenderer.init(*engine, width, height, vertexBuffer, indexBuffer, shaderManager, camera)) {
        LOGE("Failed to initialize PipelineRenderer!");
        return false;
    }
    
    // Add composite quad entity to main scene
    scene->addEntity(pipelineRenderer.quadComposite);
    
    // Initialize 3D LUT Texture
    lutTexture = filament::Texture::Builder()
        .width(LutGenerator::LUT_SIZE)
        .height(LutGenerator::LUT_SIZE)
        .depth(LutGenerator::LUT_SIZE)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_3D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    if (!lutTexture) {
        LOGE("Failed to create 3D LUT Texture");
        return false;
    }
    
    // Allocate dummy empty data for lutTexture to make it complete immediately!
    static std::vector<uint32_t> dummyLutData(LutGenerator::LUT_SIZE * LutGenerator::LUT_SIZE * LutGenerator::LUT_SIZE, 0);
    filament::Texture::PixelBufferDescriptor dummyLutDesc(
        dummyLutData.data(), dummyLutData.size() * sizeof(uint32_t),
        filament::Texture::Format::RGBA, filament::Texture::Type::UBYTE,
        [](void* buffer, size_t size, void* user) {}, nullptr
    );
    lutTexture->setImage(*engine, 0, std::move(dummyLutDesc));
    
    // Initialize 2D Overlay Texture
    overlayTexture = filament::Texture::Builder()
        .width(width)
        .height(height)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    if (!overlayTexture) {
        LOGE("Failed to create Overlay Texture");
        return false;
    }

    // Initialize 1x1 Dummy Black Texture
    dummyBlackTexture = filament::Texture::Builder()
        .width(1).height(1).levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
    
    static uint32_t blackPixel = 0xFF000000;
    filament::Texture::PixelBufferDescriptor dummyDesc(
        &blackPixel, 4,
        filament::Texture::Format::RGBA, filament::Texture::Type::UBYTE,
        [](void* buffer, size_t size, void* user) {}, nullptr
    );
    dummyBlackTexture->setImage(*engine, 0, std::move(dummyDesc));
    
    // Set static parameters on pipeline views & composite material
    pipelineRenderer.setStaticParameters(width, height, shaderManager, dummyBlackTexture);

    // Start background threads
    lutGenerator.start();
    overlayCompositor.start(javaVm);
    
    // Trigger initial LUT bake
    triggerLutUpdate(1.0f, 1.0f, 0.0f, 5000.0f, 0.0f,
                     50.0f, 50.0f, 50.0f, 50.0f,
                     50.0f, 50.0f, 50.0f, 50.0f,
                     350.0f, 40.0f, 70.0f, 110.0f,
                     170.0f, 230.0f, 280.0f, 315.0f,
                     0.0f, 1.0f, 0.5f,
                     1.0f, 1.0f, 1.0f, 1.0f,
                     0.0f,
                     0.0f, 0.0f, 0.0f, 0.0f,
                     0.0f, 0.0f, 0.0f, 0.0f);

    LOGI("Filament Engine initialized successfully.");
    return true;
}

GrovkornetEngine::~GrovkornetEngine() {
    LOGI("Destroying Filament Engine resources...");
    
    // Stop background threads
    lutGenerator.stop();
    overlayCompositor.stop();
    
    if (engine) {
        LOGI("Flushing Engine before destruction...");
        if (!skipGlFlush) {
            engine->flushAndWait();
        }

        LOGI("Destroying streams and swapchains...");
        if (filamentStream) {
            engine->destroy(filamentStream);
            filamentStream = nullptr;
        }
        if (liveSwapChain) {
            engine->destroy(liveSwapChain);
            liveSwapChain = nullptr;
        }
        
        LOGI("Destroying PipelineRenderer...");
        pipelineRenderer.destroy(*engine);
        
        LOGI("Destroying vertex & index buffers...");
        if (vertexBuffer) {
            engine->destroy(vertexBuffer);
            vertexBuffer = nullptr;
        }
        if (indexBuffer) {
            engine->destroy(indexBuffer);
            indexBuffer = nullptr;
        }
        
        LOGI("Destroying ShaderManager...");
        shaderManager.destroy(*engine);
        
        LOGI("Destroying Textures...");
        if (inputTexture2D) engine->destroy(inputTexture2D);
        if (inputTextureExternal) engine->destroy(inputTextureExternal);
        if (lutTexture) engine->destroy(lutTexture);
        if (overlayTexture) engine->destroy(overlayTexture);
        if (dummyBlackTexture) engine->destroy(dummyBlackTexture);
        LOGI("Textures destroyed!");
        
        if (swapChain) engine->destroy(swapChain);
        LOGI("Destroyed swapchains");
        
        engine->destroy(view);
        engine->destroy(scene);
        LOGI("Destroyed main view and scene");
        
        if (camera) {
            utils::Entity camEntity = camera->getEntity();
            engine->destroyCameraComponent(camEntity);
            utils::EntityManager::get().destroy(camEntity);
        }
        LOGI("Destroyed camera");
        
        if (renderer) engine->destroy(renderer);
        LOGI("Destroyed renderer");
        
        LOGI("Calling Engine::destroy()...");
        filament::Engine::destroy(&engine);
        LOGI("Engine destroyed successfully!");
        engine = nullptr;
    }
    LOGI("Filament Engine resources destroyed.");
}

void GrovkornetEngine::triggerLutUpdate(float saturation, float contrast, float ev, float temperature, float tint,
                                        float satRed, float satOrange, float satYellow, float satGreen,
                                        float satCyan, float satBlue, float satPurple, float satMagenta,
                                        float boundMagentaRed, float boundRedOrange, float boundOrangeYellow, float boundYellowGreen,
                                        float boundGreenCyan, float boundCyanBlue, float boundBluePurple, float boundPurpleMagenta,
                                        float blackLevel, float highlights, float pivot,
                                        float contrastAuto, float blackLevelAuto, float highlightsAuto, float pivotAuto,
                                        float hue,
                                        float hueRed, float hueOrange, float hueYellow, float hueGreen,
                                        float hueCyan, float hueBlue, float huePurple, float hueMagenta) {
    lutGenerator.triggerLutUpdate(saturation, contrast, ev, temperature, tint,
                                  satRed, satOrange, satYellow, satGreen,
                                  satCyan, satBlue, satPurple, satMagenta,
                                  boundMagentaRed, boundRedOrange, boundOrangeYellow, boundYellowGreen,
                                  boundGreenCyan, boundCyanBlue, boundBluePurple, boundPurpleMagenta,
                                  blackLevel, highlights, pivot,
                                  contrastAuto, blackLevelAuto, highlightsAuto, pivotAuto,
                                  hue,
                                  hueRed, hueOrange, hueYellow, hueGreen,
                                  hueCyan, hueBlue, huePurple, hueMagenta);
}

void GrovkornetEngine::applyLutTextureUpdate() {
    lutGenerator.applyLutTextureUpdate(*engine, lutTexture);
}

void GrovkornetEngine::applyShaderParameters(const RenderState* state, filament::MaterialInstance* inputMaterial, bool waitForLut) {
    if (!state) return;
    const RenderParams& params = state->renderParams;
    
    // 1. Trigger LUT calculation on CPU and apply it to GPU texture
    triggerLutUpdate(params.saturation, params.contrast, state->ev, params.temperature, params.tint,
                     params.satRed, params.satOrange, params.satYellow, params.satGreen,
                     params.satCyan, params.satBlue, params.satPurple, params.satMagenta,
                     params.boundMagentaRed, params.boundRedOrange, params.boundOrangeYellow, params.boundYellowGreen,
                     params.boundGreenCyan, params.boundCyanBlue, params.boundBluePurple, params.boundPurpleMagenta,
                     params.blackLevel, params.highlights, params.pivot,
                     params.contrastAuto, params.blackLevelAuto, params.highlightsAuto, params.pivotAuto,
                     params.hue,
                     params.hueRed, params.hueOrange, params.hueYellow, params.hueGreen,
                     params.hueCyan, params.hueBlue, params.huePurple, params.hueMagenta);
    if (waitForLut) {
        lutGenerator.waitForLut();
    }
    applyLutTextureUpdate();
    applyOverlayTextureUpdate();

    // 2. Set LutTexture parameter on inputMaterial
    filament::TextureSampler sampler3d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR, filament::TextureSampler::WrapMode::CLAMP_TO_EDGE);
    inputMaterial->setParameter("u_LutTexture", lutTexture, sampler3d);

    // 3. Set parameters on materialInstanceComposite
    filament::MaterialInstance* composite = shaderManager.getMaterialInstanceComposite();
    
    filament::math::float4 uboData[8];
    uboData[0].x = params.grainIntensity;
    uboData[0].y = params.grainChroma;
    uboData[0].z = params.grainSize;
    uboData[0].w = params.grainSpeed;

    uboData[1].x = params.grainRoughness;
    uboData[1].y = params.vignetteIntensity;
    uboData[1].z = params.chromaShift;
    uboData[1].w = params.chromaShiftDirection;

    uboData[2].x = params.chromaShiftInvert;
    uboData[2].y = params.tapeJitter;
    uboData[2].z = params.scanlines;
    uboData[2].w = params.scanlinesHorizontal;

    uboData[3].x = params.scanlinesDensity;
    // Calculate time dynamically in C++ to avoid per-frame JNI overhead
    double timeMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
    uboData[3].y = static_cast<float>(fmod(timeMs / 1000.0, 3.14159265358979323846 * 2.0));
    uboData[3].z = params.bloomIntensity;
    uboData[3].w = params.chromaticAberration;

    uboData[4].x = state->invertYShift ? 1.0f : 0.0f;
    uboData[4].y = params.aberrationInvert;
    uboData[4].z = overlayCompositor.isOverlayEnabled() ? 1.0f : 0.0f;
    uboData[4].w = drsManager.getScale(); // u_DrsScale

    uboData[5].x = params.sharpening;
    uboData[5].y = 1.0f / width;  // texelSize.x
    uboData[5].z = 1.0f / height; // texelSize.y
    uboData[5].w = state->targetResolution;

    uboData[6].x = params.pixelationFactor;
    uboData[6].y = params.panelY;
    uboData[6].z = params.lensDistortion;
    uboData[6].w = params.halationIntensity;

    uboData[7].x = params.bloomThreshold;
    uboData[7].y = params.halationThreshold;
    uboData[7].z = 0.0f;
    uboData[7].w = 0.0f;

    composite->setParameter("u_RenderData0", uboData[0]);
    composite->setParameter("u_RenderData1", uboData[1]);
    composite->setParameter("u_RenderData2", uboData[2]);
    composite->setParameter("u_RenderData3", uboData[3]);
    composite->setParameter("u_RenderData4", uboData[4]);
    composite->setParameter("u_RenderData5", uboData[5]);
    composite->setParameter("u_RenderData6", uboData[6]);
    composite->setParameter("u_RenderData7", uboData[7]);

    // 4. Update DRS and viewports
    updateDrsAndViewport();
}


void GrovkornetEngine::triggerOverlayUpdate(std::vector<jobject>&& bitmaps, JNIEnv* env) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    overlayCompositor.triggerOverlayUpdate(std::move(bitmaps), env);
}

void GrovkornetEngine::applyOverlayTextureUpdate() {
    overlayCompositor.applyOverlayTextureUpdate(*engine, overlayTexture);
    
    filament::TextureSampler samplerLinear(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    if (overlayCompositor.isOverlayEnabled()) {
        shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayTexture", overlayTexture, samplerLinear);
    } else {
        shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayTexture", dummyBlackTexture, samplerLinear);
    }
}

void GrovkornetEngine::updateDrsAndViewport() {
    float scale = drsManager.getScale();
    
    // Update pipeline views viewports
    pipelineRenderer.updateViewports(width, height, scale);
    
    int finalVpX = viewportX;
    int finalVpY = viewportY;
    int finalVpW = viewportWidth > 0 ? viewportWidth : width;
    int finalVpH = viewportHeight > 0 ? viewportHeight : height;
    view->setViewport(filament::Viewport(finalVpX, finalVpY, finalVpW, finalVpH));
    
    shaderManager.getMaterialInstanceDownsample()->setParameter("u_DrsScale", scale);
    shaderManager.getMaterialInstanceBlurDown()->setParameter("u_DrsScale", scale);
    shaderManager.getMaterialInstanceBlurUp()->setParameter("u_DrsScale", scale);
}

void GrovkornetEngine::recordFrameTimeAndEvaluate(float frameTimeMs) {
    drsManager.recordFrameTimeAndEvaluate(frameTimeMs);
}

void GrovkornetEngine::simulateFrameTime(float frameTimeMs) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    drsManager.forceCooldownTrigger();
    drsManager.recordFrameTimeAndEvaluate(frameTimeMs);
}

void GrovkornetEngine::updateSwapChain(ANativeWindow* window) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    if (liveSwapChain) {
        engine->destroy(liveSwapChain);
        liveSwapChain = nullptr;
    }
    if (window) {
        liveSwapChain = engine->createSwapChain(window);
    }
}

void GrovkornetEngine::updateStream(jobject surfaceTexture, JNIEnv* env) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    if (filamentStream) {
        engine->destroy(filamentStream);
        filamentStream = nullptr;
    }
    if (surfaceTexture) {
        filamentStream = filament::Stream::Builder()
            .stream(reinterpret_cast<void*>(surfaceTexture))
            .build(*engine);
        if (filamentStream) {
            setExternalStream(filamentStream);
        } else {
            LOGE("Failed to create native Stream from SurfaceTexture");
        }
    }
}

void GrovkornetEngine::setExternalStream(filament::Stream* stream) {
    if (!inputTextureExternal) {
        inputTextureExternal = filament::Texture::Builder()
            .width(width)
            .height(height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_EXTERNAL)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*engine);
    }
    inputTextureExternal->setExternalStream(*engine, stream);
}

bool GrovkornetEngine::renderOffscreenFrame(void* pixelsIn, void* pixelsOut, const RenderState* state) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    return FrameRenderer::renderOffscreenFrame(*this, pixelsIn, pixelsOut, state);
}

bool GrovkornetEngine::renderHardwareBufferFrame(AHardwareBuffer* ahb, const RenderState* state) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    return FrameRenderer::renderHardwareBufferFrame(*this, ahb, state);
}

bool GrovkornetEngine::renderLiveFrame(const RenderState* state, const float* uvMatrixIn,
                                     int cameraWidth, int cameraHeight, int vpW, int vpH,
                                     bool skipScreenRender, bool isNewFrame,
                                     int& actualFps, int& stampedFps, bool& fpsUpdated) {
    std::lock_guard<std::mutex> lock(m_engineMutex);
    return FrameRenderer::renderLiveFrame(*this, state, uvMatrixIn, cameraWidth, cameraHeight, vpW, vpH,
                                         skipScreenRender, isNewFrame, actualFps, stampedFps, fpsUpdated);
}
