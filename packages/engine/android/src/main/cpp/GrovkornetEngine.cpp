#include "GrovkornetEngine.h"
#include <android/log.h>
#include <algorithm>

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

#include "GeometryBuilder.h"

#define LOG_TAG "GrovkornetEngine"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
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
    
    // Create views and scenes
    view = engine->createView();
    scene = engine->createScene();
    
    viewGrading = engine->createView();
    sceneGrading = engine->createScene();
    


    viewDownsample = engine->createView();
    sceneDownsample = engine->createScene();
    
    viewBlurDown = engine->createView();
    sceneBlurDown = engine->createScene();
    
    viewBlurUp = engine->createView();
    sceneBlurUp = engine->createScene();
    
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
    
    viewGrading->setCamera(camera);
    viewGrading->setScene(sceneGrading);
    viewGrading->setViewport(filament::Viewport(0, 0, width, height));
    viewGrading->setPostProcessingEnabled(false);
    
    viewDownsample->setCamera(camera);
    viewDownsample->setScene(sceneDownsample);
    viewDownsample->setViewport(filament::Viewport(0, 0, std::max(1, width / 4), std::max(1, height / 4)));
    viewDownsample->setPostProcessingEnabled(false);
    
    viewBlurDown->setCamera(camera);
    viewBlurDown->setScene(sceneBlurDown);
    viewBlurDown->setViewport(filament::Viewport(0, 0, std::max(1, width / 8), std::max(1, height / 8)));
    viewBlurDown->setPostProcessingEnabled(false);
    
    viewBlurUp->setCamera(camera);
    viewBlurUp->setScene(sceneBlurUp);
    viewBlurUp->setViewport(filament::Viewport(0, 0, std::max(1, width / 4), std::max(1, height / 4)));
    viewBlurUp->setPostProcessingEnabled(false);
    
    swapChain = engine->createSwapChain(width, height, filament::SwapChain::CONFIG_READABLE);
    if (!swapChain) {
        LOGE("Failed to create headless SwapChain");
        return false;
    }
    
    // 2. Initialize intermediate textures
    gradedTexture = filament::Texture::Builder()
        .width(width)
        .height(height)
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    bloomTexDown = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    bloomTexBlur = filament::Texture::Builder()
        .width(std::max(1, width / 8))
        .height(std::max(1, height / 8))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    bloomTexUp = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    if (!gradedTexture || !bloomTexDown || !bloomTexBlur || !bloomTexUp) {
        LOGE("Failed to create multi-pass textures");
        return false;
    }
    
    // Create RenderTargets
    gradedRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, gradedTexture)
        .build(*engine);
        
    bloomDownRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexDown)
        .build(*engine);
        
    bloomBlurRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexBlur)
        .build(*engine);
        
    bloomUpRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexUp)
        .build(*engine);
        
    if (!gradedRenderTarget || !bloomDownRenderTarget || !bloomBlurRenderTarget || !bloomUpRenderTarget) {
        LOGE("Failed to create multi-pass render targets");
        return false;
    }
    
    // Set render targets on views
    viewGrading->setRenderTarget(gradedRenderTarget);
    viewDownsample->setRenderTarget(bloomDownRenderTarget);
    viewBlurDown->setRenderTarget(bloomBlurRenderTarget);
    viewBlurUp->setRenderTarget(bloomUpRenderTarget);
    

    
    // 4. Initialize Geometry
    GeometryBuilder::buildQuad(*engine, vertexBuffer, indexBuffer);
    
    quadGrading = GeometryBuilder::createQuadEntity(*engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstance2D());
    quadDownsample = GeometryBuilder::createQuadEntity(*engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceDownsample());
    quadBlurDown = GeometryBuilder::createQuadEntity(*engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceBlurDown());
    quadBlurUp = GeometryBuilder::createQuadEntity(*engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceBlurUp());
    quadComposite = GeometryBuilder::createQuadEntity(*engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceComposite());
    
    // Add entities to scenes
    sceneGrading->addEntity(quadGrading);
    sceneDownsample->addEntity(quadDownsample);
    sceneBlurDown->addEntity(quadBlurDown);
    sceneBlurUp->addEntity(quadBlurUp);
    scene->addEntity(quadComposite);
    
    // 5. Initialize 3D LUT Texture
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
    
    // 6. Bind static parameters on materials
    filament::TextureSampler samplerLinear(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    
    shaderManager.getMaterialInstanceDownsample()->setParameter("u_Texture", gradedTexture, samplerLinear);
    
    float downW = std::max(1.0f, static_cast<float>(width / 4.0f));
    float downH = std::max(1.0f, static_cast<float>(height / 4.0f));
    shaderManager.getMaterialInstanceBlurDown()->setParameter("u_Texture", bloomTexDown, samplerLinear);
    shaderManager.getMaterialInstanceBlurDown()->setParameter("u_TexelSize", filament::math::float2(1.0f / downW, 1.0f / downH));
    
    float blurW = std::max(1.0f, static_cast<float>(width / 8.0f));
    float blurH = std::max(1.0f, static_cast<float>(height / 8.0f));
    shaderManager.getMaterialInstanceBlurUp()->setParameter("u_Texture", bloomTexBlur, samplerLinear);
    shaderManager.getMaterialInstanceBlurUp()->setParameter("u_TexelSize", filament::math::float2(1.0f / blurW, 1.0f / blurH));
    
    shaderManager.getMaterialInstanceComposite()->setParameter("u_Texture", gradedTexture, samplerLinear);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_BloomTexture", bloomTexUp, samplerLinear);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayTexture", dummyBlackTexture, samplerLinear);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayEnabled", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainIntensity", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainChroma", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_GrainSize", 1.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_VignetteIntensity", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_VhsIntensity", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_Time", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_Sharpening", 0.0f);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_TexelSize", filament::math::float2(1.0f / width, 1.0f / height));

    // Start background threads
    lutGenerator.start();
    overlayCompositor.start(javaVm);
    
    // Trigger initial LUT bake
    triggerLutUpdate(1.0f, 1.0f, 0.0f, 5000.0f, 0.0f);

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
        
        LOGI("Destroying views and scenes...");
        if (viewGrading) engine->destroy(viewGrading);
        if (viewDownsample) engine->destroy(viewDownsample);
        if (viewBlurDown) engine->destroy(viewBlurDown);
        if (viewBlurUp) engine->destroy(viewBlurUp);
        
        // Destroy scenes
        if (sceneGrading) engine->destroy(sceneGrading);
        if (sceneDownsample) engine->destroy(sceneDownsample);
        if (sceneBlurDown) engine->destroy(sceneBlurDown);
        if (sceneBlurUp) engine->destroy(sceneBlurUp);
        
        LOGI("Destroying entities and buffers...");
        engine->destroy(quadGrading);
        engine->destroy(quadDownsample);
        engine->destroy(quadBlurDown);
        engine->destroy(quadBlurUp);
        engine->destroy(quadComposite);
        
        utils::EntityManager::get().destroy(quadGrading);
        utils::EntityManager::get().destroy(quadDownsample);
        utils::EntityManager::get().destroy(quadBlurDown);
        utils::EntityManager::get().destroy(quadBlurUp);
        utils::EntityManager::get().destroy(quadComposite);
        
        if (vertexBuffer) engine->destroy(vertexBuffer);
        if (indexBuffer) engine->destroy(indexBuffer);
        
        LOGI("Destroying ShaderManager...");
        // Destroy materials/instances via ShaderManager
        shaderManager.destroy(*engine);
        
        LOGI("Destroying RenderTargets...");
        // Destroy RenderTargets first
        if (gradedRenderTarget) engine->destroy(gradedRenderTarget);
        if (bloomDownRenderTarget) engine->destroy(bloomDownRenderTarget);
        if (bloomBlurRenderTarget) engine->destroy(bloomBlurRenderTarget);
        if (bloomUpRenderTarget) engine->destroy(bloomUpRenderTarget);
        
        LOGI("Destroying Textures...");
        // Destroy Textures
        if (inputTexture2D) engine->destroy(inputTexture2D);
        if (inputTextureExternal) engine->destroy(inputTextureExternal);
        if (lutTexture) engine->destroy(lutTexture);
        if (gradedTexture) engine->destroy(gradedTexture);
        if (bloomTexDown) engine->destroy(bloomTexDown);
        if (bloomTexBlur) engine->destroy(bloomTexBlur);
        if (bloomTexUp) engine->destroy(bloomTexUp);
        if (overlayTexture) engine->destroy(overlayTexture);
        if (dummyBlackTexture) engine->destroy(dummyBlackTexture);
        LOGI("Textures destroyed!");
        
        if (swapChain) engine->destroy(swapChain);
        LOGI("Destroyed swapchains");
        engine->destroy(view);
        engine->destroy(scene);
        LOGI("Destroyed main view and scene");
        
        utils::Entity cameraEntity = camera->getEntity();
        engine->destroyCameraComponent(cameraEntity);
        utils::EntityManager::get().destroy(cameraEntity);
        LOGI("Destroyed camera");
        
        engine->destroy(renderer);
        LOGI("Destroyed renderer");
        
        LOGI("Calling Engine::destroy()...");
        filament::Engine::destroy(&engine);
        LOGI("Engine destroyed successfully!");
        engine = nullptr;
    }
    LOGI("Filament Engine resources destroyed.");
}

void GrovkornetEngine::triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint) {
    lutGenerator.triggerLutUpdate(saturation, contrast, ev, whiteBalance, tint);
}

void GrovkornetEngine::applyLutTextureUpdate() {
    lutGenerator.applyLutTextureUpdate(*engine, lutTexture);
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
    int vWidth = std::max(1, static_cast<int>(width * currentDrsScale));
    int vHeight = std::max(1, static_cast<int>(height * currentDrsScale));
    
    viewGrading->setViewport(filament::Viewport(0, 0, vWidth, vHeight));
    viewDownsample->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 4), std::max(1, vHeight / 4)));
    viewBlurDown->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 8), std::max(1, vHeight / 8)));
    viewBlurUp->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 4), std::max(1, vHeight / 4)));
    
    int finalVpX = viewportX;
    int finalVpY = viewportY;
    int finalVpW = viewportWidth > 0 ? viewportWidth : width;
    int finalVpH = viewportHeight > 0 ? viewportHeight : height;
    view->setViewport(filament::Viewport(finalVpX, finalVpY, finalVpW, finalVpH));
    
    shaderManager.getMaterialInstanceDownsample()->setParameter("u_DrsScale", currentDrsScale);
    shaderManager.getMaterialInstanceBlurDown()->setParameter("u_DrsScale", currentDrsScale);
    shaderManager.getMaterialInstanceBlurUp()->setParameter("u_DrsScale", currentDrsScale);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_DrsScale", currentDrsScale);
}

void GrovkornetEngine::recordFrameTimeAndEvaluate(float frameTimeMs) {
    recentFrameTimes.push_back(frameTimeMs);
    if (recentFrameTimes.size() > FRAME_TIME_WINDOW_SIZE) {
        recentFrameTimes.erase(recentFrameTimes.begin());
    }
    
    framesSinceLastDrsScale++;
    if (framesSinceLastDrsScale >= DRS_COOLDOWN_FRAMES && recentFrameTimes.size() == FRAME_TIME_WINDOW_SIZE) {
        float avgFrameTime = 0.0f;
        for (float t : recentFrameTimes) {
            avgFrameTime += t;
        }
        avgFrameTime /= recentFrameTimes.size();
        
        float nextScale = currentDrsScale;
        if (avgFrameTime > 15.0f) {
            nextScale = std::max(MIN_DRS_SCALE, currentDrsScale - 0.1f);
        } else if (avgFrameTime < 11.0f) {
            nextScale = std::min(MAX_DRS_SCALE, currentDrsScale + 0.05f);
        }
        
        if (nextScale != currentDrsScale) {
            currentDrsScale = nextScale;
            framesSinceLastDrsScale = 0;
            LOGI("DRS Scale changed to %.2f (avg frame time: %.2f ms)", currentDrsScale, avgFrameTime);
        }
    }
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
