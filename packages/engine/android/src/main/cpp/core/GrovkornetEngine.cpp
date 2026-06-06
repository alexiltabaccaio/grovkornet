#include "GrovkornetEngine.h"
#include "FrameRenderer.h"
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

RenderParams parseRenderParams(const float* params) {
    RenderParams rp;
    // @@GEN_PARSING_START@@
    rp.saturation = params[0];
    rp.contrast = params[1];
    rp.grainIntensity = params[2];
    rp.grainChroma = params[3];
    rp.grainSize = params[4];
    rp.grainSpeed = params[5];
    rp.vignetteIntensity = params[6];
    rp.chromaShift = params[7];
    rp.time = params[8];
    rp.ev = params[9];
    rp.whiteBalance = params[10];
    rp.tint = params[11];
    rp.bloomIntensity = params[12];
    rp.chromaticAberration = params[13];
    rp.chromaShiftDirection = params[14];
    rp.sharpening = params[15];
    rp.satRed = params[16];
    rp.satOrange = params[17];
    rp.satYellow = params[18];
    rp.satGreen = params[19];
    rp.satCyan = params[20];
    rp.satBlue = params[21];
    rp.satPurple = params[22];
    rp.satMagenta = params[23];
    rp.targetFps = params[24];
    rp.aspectRatio = params[25];
    rp.targetResolution = params[26];
    rp.invertYShift = params[27];
    rp.aberrationInvert = params[28];
    rp.boundMagentaRed = params[29];
    rp.boundRedOrange = params[30];
    rp.boundOrangeYellow = params[31];
    rp.boundYellowGreen = params[32];
    rp.boundGreenCyan = params[33];
    rp.boundCyanBlue = params[34];
    rp.boundBluePurple = params[35];
    rp.boundPurpleMagenta = params[36];
    rp.grainRoughness = params[37];
    rp.panelY = params[38];
    rp.blackLevel = params[39];
    rp.highlights = params[40];
    rp.pivot = params[41];
    rp.contrastAuto = params[42];
    rp.blackLevelAuto = params[43];
    rp.highlightsAuto = params[44];
    rp.pivotAuto = params[45];
    rp.pixelationFactor = params[46];
    rp.tapeJitter = params[47];
    rp.scanlines = params[48];
    rp.chromaShiftInvert = params[49];
    rp.hue = params[50];
    rp.hueRed = params[51];
    rp.hueOrange = params[52];
    rp.hueYellow = params[53];
    rp.hueGreen = params[54];
    rp.hueCyan = params[55];
    rp.hueBlue = params[56];
    rp.huePurple = params[57];
    rp.hueMagenta = params[58];
    // @@GEN_PARSING_END@@
    return rp;
}

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
        engine->flushAndWait();

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

void GrovkornetEngine::triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint,
                                        float satRed, float satOrange, float satYellow, float satGreen,
                                        float satCyan, float satBlue, float satPurple, float satMagenta,
                                        float boundMagentaRed, float boundRedOrange, float boundOrangeYellow, float boundYellowGreen,
                                        float boundGreenCyan, float boundCyanBlue, float boundBluePurple, float boundPurpleMagenta,
                                        float blackLevel, float highlights, float pivot,
                                        float contrastAuto, float blackLevelAuto, float highlightsAuto, float pivotAuto,
                                        float hue,
                                        float hueRed, float hueOrange, float hueYellow, float hueGreen,
                                        float hueCyan, float hueBlue, float huePurple, float hueMagenta) {
    lutGenerator.triggerLutUpdate(saturation, contrast, ev, whiteBalance, tint,
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

void GrovkornetEngine::applyShaderParameters(const RenderParams& params, filament::MaterialInstance* inputMaterial, bool waitForLut) {
    // 1. Trigger LUT calculation on CPU and apply it to GPU texture
    triggerLutUpdate(params.saturation, params.contrast, params.ev, params.whiteBalance, params.tint,
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
    composite->setParameter("u_GrainIntensity", params.grainIntensity);
    composite->setParameter("u_GrainChroma", params.grainChroma);
    composite->setParameter("u_GrainSize", params.grainSize);
    composite->setParameter("u_GrainSpeed", params.grainSpeed);
    composite->setParameter("u_GrainRoughness", params.grainRoughness);
    composite->setParameter("u_VignetteIntensity", params.vignetteIntensity);
    composite->setParameter("u_ChromaShift", params.chromaShift);
    composite->setParameter("u_ChromaShiftDirection", params.chromaShiftDirection);
    composite->setParameter("u_ChromaShiftInvert", params.chromaShiftInvert);
    composite->setParameter("u_TapeJitter", params.tapeJitter);
    composite->setParameter("u_Scanlines", params.scanlines);
    composite->setParameter("u_Time", params.time);
    composite->setParameter("u_BloomIntensity", params.bloomIntensity);
    composite->setParameter("u_ChromaticAberration", params.chromaticAberration);
    composite->setParameter("u_InvertYShift", params.invertYShift);
    composite->setParameter("u_AberrationInvert", params.aberrationInvert);
    composite->setParameter("u_OverlayEnabled", overlayCompositor.isOverlayEnabled() ? 1.0f : 0.0f);
    composite->setParameter("u_PanelY", params.panelY);

    filament::math::float2 texelSize{1.0f / width, 1.0f / height};
    composite->setParameter("u_TexelSize", texelSize);
    composite->setParameter("u_Sharpening", params.sharpening);
    composite->setParameter("u_TargetResolution", params.targetResolution);
    composite->setParameter("u_PixelationFactor", params.pixelationFactor);

    // 4. Update DRS and viewports
    updateDrsAndViewport();
}


void GrovkornetEngine::triggerOverlayUpdate(std::vector<jobject>&& bitmaps, JNIEnv* env) {
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
    shaderManager.getMaterialInstanceComposite()->setParameter("u_DrsScale", scale);
}

void GrovkornetEngine::recordFrameTimeAndEvaluate(float frameTimeMs) {
    drsManager.recordFrameTimeAndEvaluate(frameTimeMs);
}

void GrovkornetEngine::simulateFrameTime(float frameTimeMs) {
    drsManager.forceCooldownTrigger();
    drsManager.recordFrameTimeAndEvaluate(frameTimeMs);
}

void GrovkornetEngine::updateSwapChain(ANativeWindow* window) {
    if (liveSwapChain) {
        engine->destroy(liveSwapChain);
        liveSwapChain = nullptr;
    }
    if (window) {
        liveSwapChain = engine->createSwapChain(window);
    }
}

void GrovkornetEngine::updateStream(jobject surfaceTexture, JNIEnv* env) {
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

bool GrovkornetEngine::renderOffscreenFrame(void* pixelsIn, void* pixelsOut, const RenderParams& params) {
    return FrameRenderer::renderOffscreenFrame(*this, pixelsIn, pixelsOut, params);
}

bool GrovkornetEngine::renderHardwareBufferFrame(AHardwareBuffer* ahb, const RenderParams& params) {
    return FrameRenderer::renderHardwareBufferFrame(*this, ahb, params);
}

bool GrovkornetEngine::renderLiveFrame(const RenderParams& params, const float* uvMatrixIn,
                                     int cameraWidth, int cameraHeight, int vpW, int vpH,
                                     bool skipScreenRender, bool isNewFrame,
                                     int& actualFps, int& stampedFps, bool& fpsUpdated) {
    return FrameRenderer::renderLiveFrame(*this, params, uvMatrixIn, cameraWidth, cameraHeight, vpW, vpH,
                                         skipScreenRender, isNewFrame, actualFps, stampedFps, fpsUpdated);
}
