#include "pipeline/PipelineRenderer.h"
#include "pipeline/GeometryBuilder.h"
#include <utils/EntityManager.h>
#include <android/log.h>
#include <algorithm>
#include <filament/Viewport.h>
#include <filament/TextureSampler.h>

#define LOG_TAG "PipelineRenderer"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

bool PipelineRenderer::init(filament::Engine& engine, int width, int height,
                           filament::VertexBuffer* vertexBuffer, filament::IndexBuffer* indexBuffer,
                           ShaderManager& shaderManager, filament::Camera* camera) {
    LOGI("Initializing PipelineRenderer for size %dx%d...", width, height);

    // 1. Create Views & Scenes
    viewGrading = engine.createView();
    sceneGrading = engine.createScene();
    
    viewDownsample = engine.createView();
    sceneDownsample = engine.createScene();
    
    viewBlurDown = engine.createView();
    sceneBlurDown = engine.createScene();
    
    viewBlurUp = engine.createView();
    sceneBlurUp = engine.createScene();
    
    if (!viewGrading || !sceneGrading || !viewDownsample || !sceneDownsample ||
        !viewBlurDown || !sceneBlurDown || !viewBlurUp || !sceneBlurUp) {
        LOGE("Failed to create pipeline views and scenes!");
        return false;
    }

    // Set cameras and scenes for all views
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

    // 2. Initialize intermediate textures
    gradedTexture = filament::Texture::Builder()
        .width(width)
        .height(height)
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    bloomTexDown = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    bloomTexBlur = filament::Texture::Builder()
        .width(std::max(1, width / 8))
        .height(std::max(1, height / 8))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    bloomTexUp = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    if (!gradedTexture || !bloomTexDown || !bloomTexBlur || !bloomTexUp) {
        LOGE("Failed to create pipeline textures");
        return false;
    }

    // 3. Create RenderTargets
    gradedRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, gradedTexture)
        .build(engine);
        
    bloomDownRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexDown)
        .build(engine);
        
    bloomBlurRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexBlur)
        .build(engine);
        
    bloomUpRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexUp)
        .build(engine);
        
    if (!gradedRenderTarget || !bloomDownRenderTarget || !bloomBlurRenderTarget || !bloomUpRenderTarget) {
        LOGE("Failed to create pipeline render targets");
        return false;
    }

    // Set render targets on views
    viewGrading->setRenderTarget(gradedRenderTarget);
    viewDownsample->setRenderTarget(bloomDownRenderTarget);
    viewBlurDown->setRenderTarget(bloomBlurRenderTarget);
    viewBlurUp->setRenderTarget(bloomUpRenderTarget);

    // 4. Create quad entities
    quadGrading = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstance2D());
    quadDownsample = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceDownsample());
    quadBlurDown = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceBlurDown());
    quadBlurUp = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceBlurUp());
    quadComposite = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceComposite());

    // Add entities to scenes
    sceneGrading->addEntity(quadGrading);
    sceneDownsample->addEntity(quadDownsample);
    sceneBlurDown->addEntity(quadBlurDown);
    sceneBlurUp->addEntity(quadBlurUp);

    return true;
}

void PipelineRenderer::destroy(filament::Engine& engine) {
    LOGI("Destroying PipelineRenderer resources...");
    
    if (viewGrading) engine.destroy(viewGrading);
    if (viewDownsample) engine.destroy(viewDownsample);
    if (viewBlurDown) engine.destroy(viewBlurDown);
    if (viewBlurUp) engine.destroy(viewBlurUp);
    
    if (sceneGrading) engine.destroy(sceneGrading);
    if (sceneDownsample) engine.destroy(sceneDownsample);
    if (sceneBlurDown) engine.destroy(sceneBlurDown);
    if (sceneBlurUp) engine.destroy(sceneBlurUp);
    
    engine.destroy(quadGrading);
    engine.destroy(quadDownsample);
    engine.destroy(quadBlurDown);
    engine.destroy(quadBlurUp);
    engine.destroy(quadComposite);
    
    utils::EntityManager::get().destroy(quadGrading);
    utils::EntityManager::get().destroy(quadDownsample);
    utils::EntityManager::get().destroy(quadBlurDown);
    utils::EntityManager::get().destroy(quadBlurUp);
    utils::EntityManager::get().destroy(quadComposite);
    
    if (gradedRenderTarget) engine.destroy(gradedRenderTarget);
    if (bloomDownRenderTarget) engine.destroy(bloomDownRenderTarget);
    if (bloomBlurRenderTarget) engine.destroy(bloomBlurRenderTarget);
    if (bloomUpRenderTarget) engine.destroy(bloomUpRenderTarget);
    
    if (gradedTexture) engine.destroy(gradedTexture);
    if (bloomTexDown) engine.destroy(bloomTexDown);
    if (bloomTexBlur) engine.destroy(bloomTexBlur);
    if (bloomTexUp) engine.destroy(bloomTexUp);
}

void PipelineRenderer::updateViewports(int width, int height, float drsScale) {
    int vWidth = std::max(1, static_cast<int>(width * drsScale));
    int vHeight = std::max(1, static_cast<int>(height * drsScale));
    
    viewGrading->setViewport(filament::Viewport(0, 0, vWidth, vHeight));
    viewDownsample->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 4), std::max(1, vHeight / 4)));
    viewBlurDown->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 8), std::max(1, vHeight / 8)));
    viewBlurUp->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 4), std::max(1, vHeight / 4)));
}

void PipelineRenderer::setStaticParameters(int width, int height, ShaderManager& shaderManager, filament::Texture* dummyBlackTexture) {
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
}
